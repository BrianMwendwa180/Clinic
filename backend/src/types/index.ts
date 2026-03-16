import { Appointment, ContactMessage } from '@prisma/client'

// Re-export Prisma types
export { Appointment, ContactMessage }

// Extended types with relations (for future use)
export interface AppointmentWithRelations extends Appointment {
  // Add relations here when they are defined in schema
}

export interface ContactMessageWithRelations extends ContactMessage {
  // Add relations here when they are defined in schema
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string | { message: string; field?: string }[]
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Appointment types
export type AppointmentStatus = 'requested' | 'confirmed' | 'completed' | 'cancelled'

export interface AppointmentFilters {
  status?: AppointmentStatus
  department?: string
  doctor?: string
  startDate?: string
  endDate?: string
}

export interface AppointmentQueryParams {
  page?: number
  limit?: number
  status?: AppointmentStatus
  department?: string
  doctor?: string
  startDate?: string
  endDate?: string
}

export interface ContactQueryParams {
  page?: number
  limit?: number
}

// Health check type
export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'down'
  timestamp: string
  uptime: number
  database?: {
    status: string
    latency?: number
  }
}

