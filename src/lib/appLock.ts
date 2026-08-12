// Local device app-lock: a PIN gate (always available) plus an optional
// WebAuthn platform-authenticator shortcut (Face ID / Touch ID / Windows
// Hello). Everything here is stored per-device in localStorage — this is
// intentionally NOT synced through Firestore, since a PIN/biometric is a
// "is this really you holding the phone" gate on top of an already
// authenticated Firebase session, not a replacement for it. Each device
// gets its own PIN.

const PEPPER = 'loop-app-lock-v1'

export async function hashPin(pin: string): Promise<string> {
  const enc = new TextEncoder().encode(`${PEPPER}:${pin}`)
  const digest = await crypto.subtle.digest('SHA-256', enc)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  if (!window.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable) return false
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch {
    return false
  }
}

function bufferToBase64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
}

function base64ToBuffer(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
}

/** Registers a platform-authenticator (Face ID / Touch ID / Windows Hello)
 *  credential and returns its id (base64), or null if unavailable/cancelled. */
export async function registerBiometric(userId: string): Promise<string | null> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) return null
  try {
    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: { name: 'Loop' },
        user: {
          id: new TextEncoder().encode(userId),
          name: 'loop-user',
          displayName: 'Loop',
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 }, // ES256
          { type: 'public-key', alg: -257 }, // RS256
        ],
        authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
        timeout: 60000,
      },
    })) as PublicKeyCredential | null
    if (!credential) return null
    return bufferToBase64(credential.rawId)
  } catch (err) {
    console.error('Biometric registration failed:', err)
    return null
  }
}

/** Prompts Face ID / Touch ID / Windows Hello for the given credential id.
 *  Resolves true only if the platform authenticator actually succeeded. */
export async function verifyBiometric(credentialIdB64: string): Promise<boolean> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) return false
  try {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        allowCredentials: [{ id: base64ToBuffer(credentialIdB64), type: 'public-key' }],
        userVerification: 'required',
        timeout: 60000,
      },
    })
    return !!assertion
  } catch (err) {
    console.error('Biometric verification failed or was cancelled:', err)
    return false
  }
}
