import { Router } from 'express'
import { z } from 'zod'
import prisma from '../prismaClient'
import nodemailer from 'nodemailer'

const router = Router()

const appointmentSchema = z.object({
  patientName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  department: z.string().optional(),
  doctor: z.string().optional(),
  dateTime: z.string().refine((s) => !Number.isNaN(Date.parse(s)), { message: 'Invalid date' }),
  notes: z.string().optional(),
})

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().optional(),
  message: z.string().min(1),
})

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

router.post('/appointments', async (req, res, next) => {
  try {
    const parsed = appointmentSchema.parse(req.body)
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

router.post('/contact', async (req, res, next) => {
  try {
    const parsed = contactSchema.parse(req.body)
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

export default router
