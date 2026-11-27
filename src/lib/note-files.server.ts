// SERVER-ONLY. Store ciphertext, not plaintext: the managed generic file endpoint only
// requires sign-in. Only the owner-checked note download route obtains these keys.
function encode(bytes: Uint8Array): string { return btoa(String.fromCharCode(...bytes)) }
function decode(value: string): Uint8Array<ArrayBuffer> { return Uint8Array.from(atob(value), c => c.charCodeAt(0)) }
export async function encryptAttachment(bytes: ArrayBuffer) {
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes)
  return { ciphertext, key: encode(new Uint8Array(await crypto.subtle.exportKey('raw', key))), iv: encode(iv) }
}
export async function decryptAttachment(bytes: ArrayBuffer, keyValue: string, ivValue: string): Promise<ArrayBuffer> {
  const key = await crypto.subtle.importKey('raw', decode(keyValue), { name: 'AES-GCM' }, false, ['decrypt'])
  return crypto.subtle.decrypt({ name: 'AES-GCM', iv: decode(ivValue) }, key, bytes)
}
export function signatureMatches(bytes: ArrayBuffer, type: string): boolean {
  const b = new Uint8Array(bytes)
  if (type === 'image/jpeg') return b[0] === 255 && b[1] === 216 && b[2] === 255
  if (type === 'image/png') return [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => b[i] === v)
  if (type === 'application/pdf') return new TextDecoder().decode(b.slice(0, 5)) === '%PDF-'
  if (type === 'image/webp') return new TextDecoder().decode(b.slice(0, 4)) === 'RIFF' && new TextDecoder().decode(b.slice(8, 12)) === 'WEBP'
  return false
}
export async function digest(bytes: BufferSource): Promise<string> {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('')
}
