import { z } from 'zod'

export const emailSchema = z.string().trim().email('Enter a valid email address.').max(254, 'Use an email address with no more than 254 characters.')
export const passwordSchema = z.string().min(8, 'Use at least 8 characters.').max(128, 'Use no more than 128 characters.')
export const loginSchema = z.object({ email: emailSchema, password: passwordSchema })
export const signupSchema = loginSchema.extend({ name: z.string().trim().min(1, 'Enter your name.').max(100, 'Use no more than 100 characters for your name.') })
export const recoverySchema = z.object({ email: emailSchema })
export const resetSchema = z.object({ token: z.string().min(1, 'Open a valid password-reset link from your email.'), newPassword: passwordSchema, confirmPassword: z.string() }).refine(v => v.newPassword === v.confirmPassword, { path: ['confirmPassword'], message: 'The passwords must match.' })
export const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024
export const ATTACHMENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
export const noteSchema = z.object({
  id: z.string().uuid('Please wait for the notebook to be ready.'),
  title: z.string().trim().min(1, 'Give your note a title.').max(100, 'Use no more than 100 characters for the title.'),
  body: z.string().trim().min(1, 'Write a few words about your coffee.').max(5000, 'Use no more than 5,000 characters for your note.'),
  fileSize: z.number().int().min(0).max(MAX_ATTACHMENT_SIZE, 'Choose a file smaller than 5 MB.'),
  fileType: z.string(),
}).refine(v => v.fileSize === 0 || ATTACHMENT_TYPES.includes(v.fileType), { path: ['fileType'], message: 'Choose a JPEG, PNG, WebP image or PDF.' })
export type NoteInput = z.infer<typeof noteSchema>
