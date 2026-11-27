import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { requireUser } from '@/lib/session.server'
import { storage } from '@/lib/storage'
import { coffeeNotes, noteSaveAttempts } from '@/db/schema'
import { validateInput, invalidInput } from '@/lib/monstarx/validation'
import { attachmentFrom, noteFieldsFrom, noteFormSchema, noteIdSchema } from '@/lib/notes'
import type { NoteSummary, SaveStatus } from '@/lib/notes'
import { digest, encryptAttachment, signatureMatches } from '@/lib/note-files.server'

export const listCoffeeNotes = createServerFn({ method: 'GET' }).handler(async (): Promise<NoteSummary[]> => {
  const user = await requireUser()
  const db = await getDb()
  return await db.select({ id: coffeeNotes.id, title: coffeeNotes.title, body: coffeeNotes.body,
    fileName: coffeeNotes.fileName, fileType: coffeeNotes.fileType, fileSize: coffeeNotes.fileSize, createdAt: coffeeNotes.createdAt,
  }).from(coffeeNotes).where(eq(coffeeNotes.userId, user.id)).orderBy(desc(coffeeNotes.createdAt), desc(coffeeNotes.id))
})

export const getNoteSaveStatus = createServerFn({ method: 'GET' }).validator((input: { id: string }) => input).handler(async ({ data }) => {
  const user = await requireUser()
  const checked = validateInput(noteIdSchema, data)
  if (!checked.ok) return { error: checked.error }
  const db = await getDb()
  const id = checked.data.id
  const saved = await db.select({ id: coffeeNotes.id }).from(coffeeNotes).where(and(eq(coffeeNotes.id, id), eq(coffeeNotes.userId, user.id))).get()
  if (saved) return { state: 'saved', id } satisfies SaveStatus
  const attempt = await db.select({ state: noteSaveAttempts.state }).from(noteSaveAttempts).where(and(eq(noteSaveAttempts.id, id), eq(noteSaveAttempts.userId, user.id))).get()
  return { state: attempt?.state === 'failed' ? 'failed' : attempt ? 'pending' : 'not_found', id } satisfies SaveStatus
})

export const saveCoffeeNote = createServerFn({ method: 'POST' }).validator((input: unknown) => {
  if (!(input instanceof FormData)) throw new Error('Please submit the note using the notebook form.')
  return input
}).handler(async ({ data }) => {
  const user = await requireUser()
  const checked = validateInput(noteFormSchema, noteFieldsFrom(data))
  if (!checked.ok) return { error: checked.error }
  const input = checked.data
  const file = attachmentFrom(data)
  let bytes: ArrayBuffer
  try { bytes = file ? await file.arrayBuffer() : new ArrayBuffer(0) }
  catch { return { error: 'We couldn’t read that attachment. Choose the file again.' } }
  if (file && !signatureMatches(bytes, file.type)) {
    return { error: invalidInput('The attachment does not match its file type.', { fileType: 'Choose a valid JPEG, PNG, WebP image or PDF.' }).error }
  }
  const db = await getDb()
  const payloadHash = await digest(new TextEncoder().encode(JSON.stringify([input.title, input.body, file?.name ?? '', file?.type ?? '', await digest(bytes)])))
  const createdAt = new Date().toISOString()
  try {
    const inserted = await db.insert(noteSaveAttempts).values({ id: input.id, userId: user.id, payloadHash, state: 'pending', createdAt }).onConflictDoNothing({ target: noteSaveAttempts.id }).returning({ id: noteSaveAttempts.id })
    if (inserted.length === 0) {
      const attempt = await db.select({ payloadHash: noteSaveAttempts.payloadHash, state: noteSaveAttempts.state }).from(noteSaveAttempts).where(and(eq(noteSaveAttempts.id, input.id), eq(noteSaveAttempts.userId, user.id))).get()
      if (!attempt || attempt.payloadHash !== payloadHash) return { error: 'This save attempt cannot be reused with different details. Check its saved status before starting another note.' }
      const saved = await db.select({ id: coffeeNotes.id }).from(coffeeNotes).where(and(eq(coffeeNotes.id, input.id), eq(coffeeNotes.userId, user.id))).get()
      if (saved) return { ok: true, id: saved.id }
      return { error: attempt.state === 'failed' ? 'This attempt did not save. Check its status to start a new attempt.' : 'This note is still being saved. Check its saved status before trying again.' }
    }
  } catch (error) {
    console.error('Could not reserve a coffee-note save', error instanceof Error ? error.name : 'Unknown error')
    return { error: 'We couldn’t confirm this save attempt. Check its saved status before trying again.' }
  }
  let databaseWriteStarted = false
  try {
    let attachment: { fileKey: string; fileName: string; fileType: string; fileSize: number; encryptionKey: string; encryptionIv: string } | undefined
    if (file) {
      const encrypted = await encryptAttachment(bytes)
      const fileKey = `private/note-attachments/${crypto.randomUUID()}.bin`
      await storage.put(fileKey, encrypted.ciphertext, { contentType: 'application/octet-stream' })
      attachment = { fileKey, fileName: file.name.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 160) || 'attachment', fileType: file.type, fileSize: file.size, encryptionKey: encrypted.key, encryptionIv: encrypted.iv }
    }
    databaseWriteStarted = true
    await db.insert(coffeeNotes).values({ id: input.id, userId: user.id, title: input.title, body: input.body, createdAt, ...attachment })
    // The committed note is authoritative even if the optional attempt marker update fails.
    try { await db.update(noteSaveAttempts).set({ state: 'saved' }).where(and(eq(noteSaveAttempts.id, input.id), eq(noteSaveAttempts.userId, user.id))) }
    catch { console.warn('Coffee note saved; attempt marker could not be updated') }
    return { ok: true, id: input.id }
  } catch (error) {
    console.error('Coffee-note save needs reconciliation', error instanceof Error ? error.name : 'Unknown error')
    if (!databaseWriteStarted) {
      // No note insert has been sent. Even if an object upload finishes later, no note can commit.
      try { await db.update(noteSaveAttempts).set({ state: 'failed' }).where(and(eq(noteSaveAttempts.id, input.id), eq(noteSaveAttempts.userId, user.id))) } catch { /* Keep the durable pending marker when its outcome is unknown. */ }
    }
    // Never delete an attachment or retry a database write after an uncertain commit.
    return { error: 'We couldn’t confirm that your note saved. Your draft is still here. Check its saved status below.' }
  }
})
