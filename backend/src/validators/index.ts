import { z } from 'zod'

// Appointment validation schemas
export const createAppointmentSchema = z.object({
  patientName: z.string().min(1, 'Patient name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  department: z.string().optional(),
  doctor: z.string().optional(),
  dateTime: z.string().refine((s) => !Number.isNaN(Date.parse(s)), {
    message: 'Invalid date format',
  }),
  notes: z.string().optional(),
})

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(['requested', 'confirmed', 'completed', 'cancelled']),
})

// Appointment query schemas (for filtering/pagination)
export const appointmentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.enum(['requested', 'confirmed', 'completed', 'cancelled']).optional(),
  department: z.string().optional(),
  doctor: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

// Contact message validation schemas
export const createContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().optional(),
  message: z.string().min(1, 'Message is required'),
})

// Contact query schemas (for pagination)
export const contactQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
})

// Health check schema
export const healthCheckSchema = z.object({
  // Currently no additional parameters needed
})

// Type exports
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>
export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>
export type AppointmentQuery = z.infer<typeof appointmentQuerySchema>
export type CreateContactInput = z.infer<typeof createContactSchema>
export type ContactQuery = z.infer<typeof contactQuerySchema>

