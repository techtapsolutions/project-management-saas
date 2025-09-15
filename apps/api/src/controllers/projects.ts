import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { prisma, ProjectStatus, Priority } from '@projectmgmt/database'
import { AuthenticatedRequest } from '../middleware/auth'
import { createError } from '../middleware/error-handler'
import { sanitizeSlug } from '@projectmgmt/shared'

export async function getProjects(req: AuthenticatedRequest, res: Response) {
  const { page = 1, limit = 20, status, search, sortBy = 'updatedAt', sortOrder = 'desc' } = req.query
  const organizationId = req.user!.organizationId!

  const where = {
    organizationId,
    ...(status && { status: status as string }),
    ...(search && {
      OR: [
        { name: { contains: search as string, mode: 'insensitive' as const } },
        { description: { contains: search as string, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [projects, totalCount] = await Promise.all([
    prisma.project.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
        tasks: {
          select: {
            id: true,
            status: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            members: true,
            files: true,
          },
        },
      },
      orderBy: {
        [sortBy as string]: sortOrder as 'asc' | 'desc',
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    }),
    prisma.project.count({ where }),
  ])

  const projectsWithStats = projects.map(project => ({
    ...project,
    stats: {
      totalTasks: project._count.tasks,
      completedTasks: project.tasks.filter(t => t.status === 'done').length,
      totalMembers: project._count.members,
      totalFiles: project._count.files,
    },
    tasks: undefined, // Remove tasks array from response
    _count: undefined, // Remove _count from response
  }))

  res.json({
    success: true,
    data: {
      projects: projectsWithStats,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalCount / Number(limit)),
        totalCount,
      },
    },
  })
}

export async function createProject(req: AuthenticatedRequest, res: Response) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400)
  }

  const {
    name,
    description,
    startDate,
    endDate,
    priority = Priority.MEDIUM,
    budget,
    currency = 'USD',
  } = req.body

  const organizationId = req.user!.organizationId!
  const userId = req.user!.id

  // Generate unique slug
  let baseSlug = sanitizeSlug(name)
  if (!baseSlug) {
    throw createError('Invalid project name', 400)
  }

  let slug = baseSlug
  let counter = 1
  while (true) {
    const existing = await prisma.project.findUnique({
      where: {
        organizationId_slug: {
          organizationId,
          slug,
        },
      },
    })
    if (!existing) break
    slug = `${baseSlug}-${counter}`
    counter++
  }

  const project = await prisma.$transaction(async (tx) => {
    // Create project
    const newProject = await tx.project.create({
      data: {
        organizationId,
        name,
        description,
        slug,
        status: ProjectStatus.ACTIVE,
        priority,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        budget: budget ? parseFloat(budget) : null,
        currency,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    })

    // Add creator as project admin
    await tx.projectMember.create({
      data: {
        projectId: newProject.id,
        userId,
        role: 'admin',
      },
    })

    // Create default board
    await tx.board.create({
      data: {
        projectId: newProject.id,
        name: 'Main Board',
        type: 'kanban',
        position: 0,
        columns: {
          create: [
            { name: 'To Do', color: '#gray', position: 0 },
            { name: 'In Progress', color: '#blue', position: 1 },
            { name: 'Review', color: '#yellow', position: 2 },
            { name: 'Done', color: '#green', position: 3 },
          ],
        },
      },
    })

    return newProject
  })

  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: project,
  })
}

export async function getProject(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params
  const organizationId = req.user!.organizationId!

  const project = await prisma.project.findFirst({
    where: {
      id,
      organizationId,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              title: true,
            },
          },
        },
        orderBy: {
          joinedAt: 'asc',
        },
      },
      boards: {
        include: {
          columns: {
            orderBy: {
              position: 'asc',
            },
          },
        },
        orderBy: {
          position: 'asc',
        },
      },
      milestones: {
        where: {
          status: {
            not: 'achieved',
          },
        },
        orderBy: {
          dueDate: 'asc',
        },
        take: 5,
      },
      _count: {
        select: {
          tasks: true,
          files: true,
          comments: true,
          risks: true,
          issues: true,
        },
      },
    },
  })

  if (!project) {
    throw createError('Project not found', 404)
  }

  // Get task statistics
  const taskStats = await prisma.task.groupBy({
    by: ['status'],
    where: {
      projectId: id,
    },
    _count: {
      id: true,
    },
  })

  const taskStatistics = {
    todo: taskStats.find(s => s.status === 'todo')?._count.id || 0,
    inProgress: taskStats.find(s => s.status === 'in_progress')?._count.id || 0,
    review: taskStats.find(s => s.status === 'review')?._count.id || 0,
    done: taskStats.find(s => s.status === 'done')?._count.id || 0,
    blocked: taskStats.find(s => s.status === 'blocked')?._count.id || 0,
  }

  res.json({
    success: true,
    data: {
      ...project,
      statistics: {
        ...project._count,
        tasks: taskStatistics,
      },
      _count: undefined,
    },
  })
}

export async function updateProject(req: AuthenticatedRequest, res: Response) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400)
  }

  const { id } = req.params
  const organizationId = req.user!.organizationId!
  const {
    name,
    description,
    status,
    priority,
    startDate,
    endDate,
    budget,
    currency,
  } = req.body

  // Verify project exists and user has access
  const existingProject = await prisma.project.findFirst({
    where: {
      id,
      organizationId,
    },
    include: {
      members: {
        where: {
          userId: req.user!.id,
          role: {
            in: ['admin', 'manager'],
          },
        },
      },
    },
  })

  if (!existingProject) {
    throw createError('Project not found', 404)
  }

  if (existingProject.members.length === 0) {
    throw createError('Insufficient permissions to update project', 403)
  }

  const updateData: any = {}
  if (name !== undefined) updateData.name = name
  if (description !== undefined) updateData.description = description
  if (status !== undefined) updateData.status = status
  if (priority !== undefined) updateData.priority = priority
  if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null
  if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null
  if (budget !== undefined) updateData.budget = budget ? parseFloat(budget) : null
  if (currency !== undefined) updateData.currency = currency

  const project = await prisma.project.update({
    where: { id },
    data: updateData,
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  })

  res.json({
    success: true,
    message: 'Project updated successfully',
    data: project,
  })
}

export async function deleteProject(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params
  const organizationId = req.user!.organizationId!

  // Verify project exists and user is admin
  const project = await prisma.project.findFirst({
    where: {
      id,
      organizationId,
    },
    include: {
      members: {
        where: {
          userId: req.user!.id,
          role: 'admin',
        },
      },
    },
  })

  if (!project) {
    throw createError('Project not found', 404)
  }

  if (project.members.length === 0) {
    throw createError('Only project admins can delete projects', 403)
  }

  await prisma.project.delete({
    where: { id },
  })

  res.json({
    success: true,
    message: 'Project deleted successfully',
  })
}

export async function getProjectMembers(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params
  const organizationId = req.user!.organizationId!

  // Verify project exists and user has access
  const project = await prisma.project.findFirst({
    where: {
      id,
      organizationId,
    },
  })

  if (!project) {
    throw createError('Project not found', 404)
  }

  const members = await prisma.projectMember.findMany({
    where: {
      projectId: id,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatarUrl: true,
          title: true,
          lastLoginAt: true,
        },
      },
    },
    orderBy: {
      joinedAt: 'asc',
    },
  })

  res.json({
    success: true,
    data: members,
  })
}

export async function addProjectMember(req: AuthenticatedRequest, res: Response) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400)
  }

  const { id } = req.params
  const { userId, role = 'member' } = req.body
  const organizationId = req.user!.organizationId!

  // Verify project exists and current user can add members
  const project = await prisma.project.findFirst({
    where: {
      id,
      organizationId,
    },
    include: {
      members: {
        where: {
          userId: req.user!.id,
          role: {
            in: ['admin', 'manager'],
          },
        },
      },
    },
  })

  if (!project) {
    throw createError('Project not found', 404)
  }

  if (project.members.length === 0) {
    throw createError('Insufficient permissions to add members', 403)
  }

  // Verify user exists in organization
  const user = await prisma.organizationUser.findFirst({
    where: {
      organizationId,
      userId,
      status: 'active',
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatarUrl: true,
          title: true,
        },
      },
    },
  })

  if (!user) {
    throw createError('User not found in organization', 404)
  }

  // Check if user is already a member
  const existingMember = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: id,
        userId,
      },
    },
  })

  if (existingMember) {
    throw createError('User is already a member of this project', 409)
  }

  const member = await prisma.projectMember.create({
    data: {
      projectId: id,
      userId,
      role,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatarUrl: true,
          title: true,
        },
      },
    },
  })

  res.status(201).json({
    success: true,
    message: 'Member added to project successfully',
    data: member,
  })
}

export async function removeProjectMember(req: AuthenticatedRequest, res: Response) {
  const { id, userId } = req.params
  const organizationId = req.user!.organizationId!

  // Verify project exists and current user can remove members
  const project = await prisma.project.findFirst({
    where: {
      id,
      organizationId,
    },
    include: {
      members: {
        where: {
          userId: req.user!.id,
          role: {
            in: ['admin', 'manager'],
          },
        },
      },
    },
  })

  if (!project) {
    throw createError('Project not found', 404)
  }

  if (project.members.length === 0) {
    throw createError('Insufficient permissions to remove members', 403)
  }

  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: id,
        userId,
      },
    },
  })

  if (!member) {
    throw createError('Member not found in project', 404)
  }

  // Prevent removing the last admin
  if (member.role === 'admin') {
    const adminCount = await prisma.projectMember.count({
      where: {
        projectId: id,
        role: 'admin',
      },
    })

    if (adminCount === 1) {
      throw createError('Cannot remove the last project admin', 400)
    }
  }

  await prisma.projectMember.delete({
    where: {
      projectId_userId: {
        projectId: id,
        userId,
      },
    },
  })

  res.json({
    success: true,
    message: 'Member removed from project successfully',
  })
}

export async function updateProjectMemberRole(req: AuthenticatedRequest, res: Response) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400)
  }

  const { id, userId } = req.params
  const { role } = req.body
  const organizationId = req.user!.organizationId!

  // Verify project exists and current user can update member roles
  const project = await prisma.project.findFirst({
    where: {
      id,
      organizationId,
    },
    include: {
      members: {
        where: {
          userId: req.user!.id,
          role: 'admin',
        },
      },
    },
  })

  if (!project) {
    throw createError('Project not found', 404)
  }

  if (project.members.length === 0) {
    throw createError('Only project admins can update member roles', 403)
  }

  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: id,
        userId,
      },
    },
  })

  if (!member) {
    throw createError('Member not found in project', 404)
  }

  // Prevent demoting the last admin
  if (member.role === 'admin' && role !== 'admin') {
    const adminCount = await prisma.projectMember.count({
      where: {
        projectId: id,
        role: 'admin',
      },
    })

    if (adminCount === 1) {
      throw createError('Cannot demote the last project admin', 400)
    }
  }

  const updatedMember = await prisma.projectMember.update({
    where: {
      projectId_userId: {
        projectId: id,
        userId,
      },
    },
    data: { role },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatarUrl: true,
          title: true,
        },
      },
    },
  })

  res.json({
    success: true,
    message: 'Member role updated successfully',
    data: updatedMember,
  })
}