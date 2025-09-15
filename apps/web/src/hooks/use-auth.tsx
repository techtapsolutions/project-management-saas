'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthUser, AuthOrganization } from '@projectmgmt/shared'

interface AuthContextType {
  user: AuthUser | null
  organizations: AuthOrganization[]
  currentOrganization: AuthOrganization | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: any) => Promise<void>
  logout: () => Promise<void>
  switchOrganization: (organizationId: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [organizations, setOrganizations] = useState<AuthOrganization[]>([])
  const [currentOrganization, setCurrentOrganization] = useState<AuthOrganization | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  useEffect(() => {
    // Check if user is logged in on app load
    const token = localStorage.getItem('accessToken')
    if (token) {
      // TODO: Validate token and fetch user data
      // For now, we'll set loading to false
      setIsLoading(false)
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // TODO: Implement actual API call
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const data = await response.json()
      
      localStorage.setItem('accessToken', data.data.accessToken)
      localStorage.setItem('refreshToken', data.data.refreshToken)
      
      setUser(data.data.user)
      setOrganizations(data.data.organizations)
      setCurrentOrganization(data.data.organizations[0] || null)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (registerData: any) => {
    setIsLoading(true)
    try {
      // TODO: Implement actual API call
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      })

      if (!response.ok) {
        throw new Error('Registration failed')
      }

      const data = await response.json()
      
      localStorage.setItem('accessToken', data.data.accessToken)
      localStorage.setItem('refreshToken', data.data.refreshToken)
      
      setUser(data.data.user)
      setOrganizations(data.data.organizations)
      setCurrentOrganization(data.data.organizations[0] || null)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      // TODO: Call logout API
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      
      setUser(null)
      setOrganizations([])
      setCurrentOrganization(null)
    } finally {
      setIsLoading(false)
    }
  }

  const switchOrganization = (organizationId: string) => {
    const org = organizations.find(o => o.id === organizationId)
    if (org) {
      setCurrentOrganization(org)
      // TODO: Update the access token with new organization context
    }
  }

  const value = {
    user,
    organizations,
    currentOrganization,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    switchOrganization,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}