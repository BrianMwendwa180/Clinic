import { Router } from 'express'
import { z } from 'zod'
import prisma from '../prismaClient'
import nodemailer from 'nodemailer'
import {
  createAppointmentSchema,
  updateAppointmentStatusSchema,
  appointmentQuerySchema,
  createContactSchema,
  contactQuerySchema,
} from '../validators'

const router = Router()

// Email notification helper
async function trySendNotification(subject: string, text: string) {
  if (!process.env.SMTP_HOST) {
    console.log('SMTP not configured; skipping email send. Subject:', subject)
    return
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  })

  await transporter.sendMail({
    from: process.env.SMTP_USER || 'no-reply@example.com',
    to: process.env.SMTP_USER || 'admin@example.com',
    subject,
    text,
  })
}

// POST /api/appointments - Create a new appointment
router.post('/appointments', async (req, res, next) => {
  try {
    const parsed = createAppointmentSchema.parse(req.body)
    const appointment = await prisma.appointment.create({
      data: {
        patientName: parsed.patientName,
        email: parsed.email,
        phone: parsed.phone,
        department: parsed.department,
        doctor: parsed.doctor,
        dateTime: new Date(parsed.dateTime),
        notes: parsed.notes,
      },
    })

    // try sending a notification (best-effort)
    trySendNotification('New appointment requested', JSON.stringify(appointment, null, 2)).catch((e) =>
      console.error('Email send failed', e),
    )

    res.status(201).json({ success: true, data: appointment })
  } catch (err) {
    next(err)
  }
})

// GET /api/appointments - Get all appointments with pagination and filtering
router.get('/appointments', async (req, res, next) => {
  try {
    const parsed = appointmentQuerySchema.parse(req.query)
    const { page, limit, status, department, doctor, startDate, endDate } = parsed
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (status) where.status = status
    if (department) where.department = department
    if (doctor) where.doctor = doctor
    if (startDate || endDate) {
      where.dateTime = {}
      if (startDate) where.dateTime.gte = new Date(startDate)
      if (endDate) where.dateTime.lte = new Date(endDate)
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.appointment.count({ where }),
    ])

    res.json({
      success: true,
      data: appointments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/appointments/:id - Get a single appointment by ID
router.get('/appointments/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid appointment ID' })
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    })

    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' })
    }

    res.json({ success: true, data: appointment })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/appointments/:id - Update appointment status
router.patch('/appointments/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid appointment ID' })
    }

    const parsed = updateAppointmentStatusSchema.parse(req.body)

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status: parsed.status },
    })

    // Send notification about status change
    trySendNotification(
      `Appointment ${parsed.status}`,
      `Appointment #${id} status updated to ${parsed.status}\n\nPatient: ${appointment.patientName}\nEmail: ${appointment.email}`,
    ).catch((e) => console.error('Email send failed', e))

    res.json({ success: true, data: appointment })
  } catch (err: any) {
    if (err.name === 'PrismaClientKnownRequestError' && err.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Appointment not found' })
    }
    next(err)
  }
})

// POST /api/contact - Create a new contact message
router.post('/contact', async (req, res, next) => {
  try {
    const parsed = createContactSchema.parse(req.body)
    const msg = await prisma.contactMessage.create({
      data: {
        name: parsed.name,
        email: parsed.email,
        subject: parsed.subject,
        message: parsed.message,
      },
    })

    // best-effort notify admin
    trySendNotification('New contact message', `${parsed.name} <${parsed.email}>\n\n${parsed.message}`).catch((e) =>
      console.error('Email send failed', e),
    )

    res.status(201).json({ success: true, data: msg })
  } catch (err) {
    next(err)
  }
})

// GET /api/contacts - Get all contact messages with pagination
router.get('/contacts', async (req, res, next) => {
  try {
    const parsed = contactQuerySchema.parse(req.query)
    const { page, limit } = parsed
    const skip = (page - 1) * limit

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contactMessage.count(),
    ])

    res.json({
      success: true,
      data: messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/contacts/:id - Get a single contact message by ID
router.get('/contacts/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid contact ID' })
    }

    const message = await prisma.contactMessage.findUnique({
      where: { id },
    })

    if (!message) {
      return res.status(404).json({ success: false, error: 'Contact message not found' })
    }

    res.json({ success: true, data: message })
  } catch (err) {
    next(err)
  }
})

export default router

