// Thin wrapper around Google Identity Services (https://developers.google.com/identity/gsi/web).
// The backend validates the Google ID token directly, so the token from GIS is sent as the bearer token.

const GSI_SCRIPT_URL = 'https://accounts.google.com/gsi/client'
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string

interface CredentialResponse {
  credential: string
}

interface GoogleAccountsId {
  initialize(config: {
    client_id: string
    callback: (response: CredentialResponse) => void
    auto_select?: boolean
    use_fedcm_for_prompt?: boolean
  }): void
  prompt(): void
  renderButton(parent: HTMLElement, options: Record<string, unknown>): void
  disableAutoSelect(): void
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } }
  }
}

let scriptPromise: Promise<GoogleAccountsId> | null = null
let credentialHandler: ((token: string) => void) | null = null

function loadScript(): Promise<GoogleAccountsId> {
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    if (!CLIENT_ID) {
      reject(new Error('VITE_GOOGLE_CLIENT_ID is not set'))
      return
    }

    const script = document.createElement('script')
    script.src = GSI_SCRIPT_URL
    script.async = true
    script.defer = true
    script.onload = () => {
      const accountsId = window.google!.accounts.id
      accountsId.initialize({
        client_id: CLIENT_ID,
        callback: (response) => credentialHandler?.(response.credential),
        // Signs returning users in silently, which also covers renewal after the token expires (1 hour)
        auto_select: true,
        use_fedcm_for_prompt: true,
      })
      resolve(accountsId)
    }
    script.onerror = () => {
      scriptPromise = null
      reject(new Error('Could not load Google sign-in'))
    }
    document.head.appendChild(script)
  })

  return scriptPromise
}

/** Registers the function that receives new ID tokens from Google. */
export function onGoogleCredential(handler: (token: string) => void) {
  credentialHandler = handler
}

/** Renders the "Sign in with Google" button and shows One Tap. */
export async function renderGoogleButton(parent: HTMLElement) {
  const accountsId = await loadScript()
  accountsId.renderButton(parent, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'signin_with',
    shape: 'pill',
    locale: 'no',
  })
  accountsId.prompt()
}

/** Prevents One Tap from signing the user straight back in after logging out. */
export async function disableGoogleAutoSelect() {
  if (!scriptPromise) return
  const accountsId = await scriptPromise
  accountsId.disableAutoSelect()
}
