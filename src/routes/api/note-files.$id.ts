import { createFileRoute } from '@tanstack/react-router'
import { and, eq } from 'drizzle-orm'
import { currentUser } from '@/lib/session.server'
import { getDb } from '@/lib/db'
import { storage } from '@/lib/storage'
import { coffeeNotes } from '@/db/schema'
import { decryptAttachment } from '@/lib/note-files.server'
import { MAX_ATTACHMENT_SIZE } from '@/lib/forms'

export const Route = createFileRoute('/api/note-files/$id')({
  server: { handlers: { GET: async ({ params }) => {
    const headers = { 'cache-control': 'private, no-store, max-age=0', vary: 'Cookie', 'x-content-type-options': 'nosniff' }
    const user = await currentUser()
    if (!user) return new Response('Sign in to access this file.', { status: 401, headers })
    const db = await getDb()
    const note = await db.select().from(coffeeNotes).where(and(eq(coffeeNotes.id, params.id), eq(coffeeNotes.userId, user.id))).get()
    if (!note?.fileKey || !note.encryptionKey || !note.encryptionIv || !note.fileName) return new Response('File not found.', { status: 404, headers })
    try {
      const stored = await storage.get(note.fileKey)
      if (!stored) return new Response('File not found.', { status: 404, headers })
      if (stored.size > MAX_ATTACHMENT_SIZE + 16) throw new Error('Attachment exceeds the notebook limit')
      const bytes = await new Response(stored.body).arrayBuffer()
      if (bytes.byteLength > MAX_ATTACHMENT_SIZE + 16) throw new Error('Attachment exceeds the notebook limit')
      const plaintext = await decryptAttachment(bytes, note.encryptionKey, note.encryptionIv)
      return new Response(plaintext, { headers: { ...headers, 'content-type': note.fileType ?? 'application/octet-stream',
        'content-disposition': `attachment; filename="attachment"; filename*=UTF-8''${encodeURIComponent(note.fileName)}`,
        'content-security-policy': "default-src 'none'; sandbox",
      } })
    } catch (error) {
      console.error('Could not open a private note attachment', error instanceof Error ? error.name : 'Unknown error')
      return new Response('We couldn’t open this attachment right now. Please try again later.', { status: 503, headers })
    }
  } } },
})
