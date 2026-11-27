import { z } from 'zod'
import { ATTACHMENT_TYPES, noteSchema } from '@/lib/forms'

export const noteFormSchema = noteSchema.and(z.object({ filePresent: z.boolean() }))
  .refine(v => !v.filePresent || v.fileSize > 0, { path: ['fileSize'], message: 'Choose a file that is not empty.' })
  .refine(v => !v.filePresent || ATTACHMENT_TYPES.includes(v.fileType), { path: ['fileType'], message: 'Choose a JPEG, PNG, WebP image or PDF.' })
export const noteIdSchema = z.object({ id: z.string().uuid('Choose a valid save attempt.') })
export function attachmentFrom(data: FormData): File | null {
  const file = data.get('file')
  return file instanceof File && file.name ? file : null
}
export function noteFieldsFrom(data: FormData) {
  const file = attachmentFrom(data)
  const text = (key: string) => { const value = data.get(key); return typeof value === 'string' ? value : '' }
  return { id: text('id'), title: text('title'), body: text('body'), fileSize: file?.size ?? 0, fileType: file?.type ?? '', filePresent: Boolean(file) }
}
export type NoteSummary = { id: string; title: string; body: string; fileName: string | null; fileType: string | null; fileSize: number | null; createdAt: string }
export type SaveStatus = { state: 'saved' | 'pending' | 'failed' | 'not_found'; id: string }
