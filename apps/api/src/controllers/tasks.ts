import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { prisma, TaskStatus, Priority } from '@projectmgmt/database'
import { AuthenticatedRequest } from '../middleware/auth'
import { createError } from '../middleware/error-handler'

export async function getTasks(req: AuthenticatedRequest, res: Response) {
  const {
    page = 1,
    limit = 50,
    projectId,
    status,
    priority,
    assignedTo,
    search,
    sortBy = 'updatedAt',
    sortOrder = 'desc',
    dueDate,
  } = req.query

  const organizationId = req.user!.organizationId!

  const where: any = {}

  // Filter by project
  if (projectId) {
    // Verify user has access to project
    const projectAccess = await prisma.project.findFirst({
      where: {
        id: projectId as string,
        organizationId,
      },
    })
    
    if (!projectAccess) {
      throw createError('Project not found or access denied', 404)
    }
    
    where.projectId = projectId
  } else {
    // Only show tasks from projects user has access to
    where.project = {
      organizationId,
      members: {
        some: {
          userId: req.user!.id,
        },
      },
    }
  }

  // Apply filters
  if (status) where.status = status
  if (priority) where.priority = priority
  if (assignedTo) {
    where.assignments = {
      some: {
        userId: assignedTo as string,
      },
    }
  }
  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: 'insensitive' as const } },
      { description: { contains: search as string, mode: 'insensitive' as const } },
    ]
  }
  if (dueDate) {
    const date = new Date(dueDate as string)
    where.dueDate = {
      gte: new Date(date.setHours(0, 0, 0, 0)),
      lt: new Date(date.setHours(23, 59, 59, 999)),
    }
  }

  const [tasks, totalCount] = await Promise.all([
    prisma.task.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        parent: {
          select: {
            id: true,
            title: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        assignments: {
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
        _count: {
          select: {
            subtasks: true,
            comments: true,
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
    prisma.task.count({ where }),
  ])

  res.json({
    success: true,
    data: {
      tasks,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalCount / Number(limit)),
        totalCount,
      },
    },
  })
}

export async function createTask(req: AuthenticatedRequest, res: Response) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400)
  }

  const {
    projectId,
    parentId,
    title,
    description,
    priority = Priority.MEDIUM,
    startDate,
    dueDate,
    estimatedHours,
    tags = [],
    assignedUserIds = [],
  } = req.body

  const organizationId = req.user!.organizationId!
  const userId = req.user!.id

  // Verify project exists and user has access
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      organizationId,
      members: {
        some: {
          userId,
        },
      },
    },
  })

  if (!project) {
    throw createError('Project not found or access denied', 404)
  }

  // Verify parent task if provided
  if (parentId) {
    const parentTask = await prisma.task.findFirst({
      where: {
        id: parentId,
        projectId,
      },
    })

    if (!parentTask) {
      throw createError('Parent task not found', 404)
    }
  }

  // Verify assigned users are project members
  if (assignedUserIds.length > 0) {
    const projectMembers = await prisma.projectMember.findMany({
      where: {
        projectId,
        userId: {
          in: assignedUserIds,
        },
      },
    })

    if (projectMembers.length !== assignedUserIds.length) {
      throw createError('Some assigned users are not project members', 400)
    }
  }

  const task = await prisma.$transaction(async (tx) => {
    const newTask = await tx.task.create({
      data: {
        projectId,
        parentId,
        title,
        description,
        status: TaskStatus.TODO,
        priority,
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
        tags,
        createdById: userId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
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

    // Create task assignments
    if (assignedUserIds.length > 0) {
      await tx.taskAssignment.createMany({
        data: assignedUserIds.map((userId: string) => ({
          taskId: newTask.id,
          userId,
          role: 'assignee',
        })),
      })
    }

    return newTask
  })

  // Fetch complete task with assignments
  const completeTask = await prisma.task.findUnique({
    where: { id: task.id },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
      assignments: {
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

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: completeTask,
  })
}

export async function getTask(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params
  const organizationId = req.user!.organizationId!

  const task = await prisma.task.findFirst({
    where: {
      id,
      project: {
        organizationId,
        members: {
          some: {
            userId: req.user!.id,
          },
        },
      },
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      parent: {
        select: {
          id: true,
          title: true,
        },
      },
      subtasks: {
        include: {
          assignments: {
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
        orderBy: {
          position: 'asc',
        },
      },
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
      assignments: {
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
      },
      comments: {
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      },
      files: {
        include: {
          uploader: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      dependencies: {
        include: {
          requiredTask: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
      },
      dependents: {
        include: {
          dependentTask: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
      },
      timeEntries: {
        select: {
          id: true,
          duration: true,
          startTime: true,
          endTime: true,
          description: true,
        },
        orderBy: {
          startTime: 'desc',
        },
        take: 10,
      },
      _count: {
        select: {
          subtasks: true,
          comments: true,
          files: true,
        },
      },
    },
  })

  if (!task) {
    throw createError('Task not found or access denied', 404)
  }

  // Calculate time tracking stats
  const totalLoggedMinutes = task.timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0)
  const totalLoggedHours = totalLoggedMinutes / 60

  res.json({
    success: true,
    data: {
      ...task,
      timeTracking: {
        totalLoggedHours: Math.round(totalLoggedHours * 100) / 100,
        estimatedHours: task.estimatedHours ? Number(task.estimatedHours) : null,
        remainingHours: task.estimatedHours 
          ? Math.max(0, Number(task.estimatedHours) - totalLoggedHours) 
          : null,
      },
    },
  })
}

export async function updateTask(req: AuthenticatedRequest, res: Response) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400)
  }

  const { id } = req.params
  const organizationId = req.user!.organizationId!

  const {
    title,
    description,
    status,
    priority,
    startDate,
    dueDate,
    estimatedHours,
    actualHours,
    tags,
  } = req.body

  // Verify task exists and user has access
  const existingTask = await prisma.task.findFirst({
    where: {
      id,
      project: {
        organizationId,
        members: {
          some: {
            userId: req.user!.id,
          },
        },
      },
    },
  })

  if (!existingTask) {
    throw createError('Task not found or access denied', 404)
  }

  const updateData: any = {}
  if (title !== undefined) updateData.title = title
  if (description !== undefined) updateData.description = description
  if (status !== undefined) updateData.status = status
  if (priority !== undefined) updateData.priority = priority
  if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null
  if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
  if (estimatedHours !== undefined) updateData.estimatedHours = estimatedHours ? parseFloat(estimatedHours) : null
  if (actualHours !== undefined) updateData.actualHours = actualHours ? parseFloat(actualHours) : null
  if (tags !== undefined) updateData.tags = tags

  const task = await prisma.task.update({
    where: { id },
    data: updateData,
    include: {
      project: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
      assignments: {
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
    message: 'Task updated successfully',
    data: task,
  })
}

export async function deleteTask(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params
  const organizationId = req.user!.organizationId!

  // Verify task exists and user has access
  const task = await prisma.task.findFirst({
    where: {
      id,
      project: {
        organizationId,
        members: {
          some: {
            userId: req.user!.id,
            role: {
              in: ['admin', 'manager'],
            },
          },
        },
      },
    },
  })

  if (!task) {
    throw createError('Task not found or insufficient permissions', 404)
  }

  // Check if task has subtasks
  const subtaskCount = await prisma.task.count({
    where: {
      parentId: id,
    },
  })

  if (subtaskCount > 0) {
    throw createError('Cannot delete task with subtasks', 400)
  }

  await prisma.task.delete({
    where: { id },
  })

  res.json({
    success: true,
    message: 'Task deleted successfully',
  })
}

export async function assignTask(req: AuthenticatedRequest, res: Response) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400)
  }

  const { id } = req.params
  const { userId, role = 'assignee' } = req.body
  const organizationId = req.user!.organizationId!

  // Verify task exists and user has access
  const task = await prisma.task.findFirst({
    where: {
      id,
      project: {
        organizationId,
        members: {
          some: {
            userId: req.user!.id,
          },
        },
      },
    },
    include: {
      project: {
        select: {
          id: true,
          members: {
            where: {
              userId,
            },
          },
        },
      },
    },
  })

  if (!task) {
    throw createError('Task not found or access denied', 404)
  }

  // Verify assignee is project member
  if (task.project.members.length === 0) {
    throw createError('User is not a member of this project', 400)
  }

  // Check if user is already assigned
  const existingAssignment = await prisma.taskAssignment.findUnique({
    where: {
      taskId_userId: {
        taskId: id,
        userId,
      },
    },
  })

  if (existingAssignment) {
    throw createError('User is already assigned to this task', 409)
  }

  const assignment = await prisma.taskAssignment.create({
    data: {
      taskId: id,
      userId,
      role,
    },
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
  })

  res.status(201).json({
    success: true,
    message: 'Task assigned successfully',
    data: assignment,
  })
}

export async function unassignTask(req: AuthenticatedRequest, res: Response) {
  const { id, userId } = req.params
  const organizationId = req.user!.organizationId!

  // Verify task exists and user has access
  const task = await prisma.task.findFirst({
    where: {
      id,
      project: {
        organizationId,
        members: {
          some: {
            userId: req.user!.id,
          },
        },
      },
    },
  })

  if (!task) {
    throw createError('Task not found or access denied', 404)
  }

  const assignment = await prisma.taskAssignment.findUnique({
    where: {
      taskId_userId: {
        taskId: id,
        userId,
      },
    },
  })

  if (!assignment) {
    throw createError('User is not assigned to this task', 404)
  }

  await prisma.taskAssignment.delete({
    where: {
      taskId_userId: {
        taskId: id,
        userId,
      },
    },
  })

  res.json({
    success: true,
    message: 'Task unassigned successfully',
  })
}

export async function getTaskComments(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params
  const { page = 1, limit = 20 } = req.query
  const organizationId = req.user!.organizationId!

  // Verify task exists and user has access
  const task = await prisma.task.findFirst({
    where: {
      id,
      project: {
        organizationId,
        members: {
          some: {
            userId: req.user!.id,
          },
        },
      },
    },
  })

  if (!task) {
    throw createError('Task not found or access denied', 404)
  }

  const [comments, totalCount] = await Promise.all([
    prisma.comment.findMany({
      where: {
        taskId: id,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      where: {
        taskId: id,
        parentId: null, // Only root comments, replies are included
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    }),
    prisma.comment.count({
      where: {
        taskId: id,
        parentId: null,
      },
    }),
  ])

  res.json({
    success: true,
    data: {
      comments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalCount / Number(limit)),
        totalCount,
      },
    },
  })
}

export async function createTaskComment(req: AuthenticatedRequest, res: Response) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400)
  }

  const { id } = req.params
  const { content, parentId } = req.body
  const organizationId = req.user!.organizationId!
  const userId = req.user!.id

  // Verify task exists and user has access
  const task = await prisma.task.findFirst({
    where: {
      id,
      project: {
        organizationId,
        members: {
          some: {
            userId,
          },
        },
      },
    },
  })

  if (!task) {
    throw createError('Task not found or access denied', 404)
  }

  // Verify parent comment if provided
  if (parentId) {
    const parentComment = await prisma.comment.findFirst({
      where: {
        id: parentId,
        taskId: id,
      },
    })

    if (!parentComment) {
      throw createError('Parent comment not found', 404)
    }
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      authorId: userId,
      taskId: id,
      parentId,
    },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
    },
  })

  res.status(201).json({
    success: true,
    message: 'Comment added successfully',
    data: comment,
  })
}