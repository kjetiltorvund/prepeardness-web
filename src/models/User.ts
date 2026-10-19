/** Matches AppUserDto from the backend */
export interface User {
  id?: number
  email: string
  role: string | null
  active: boolean
  name: string | null
}

export interface UserPayload {
  email: string
  name: string | null
}

export function toUserPayload(user: User): UserPayload {
  return {
    email: user.email.trim().toLowerCase(),
    name: user.name?.trim() || null,
  }
}

export function createDefault(): User {
  return {
    email: '',
    role: null,
    active: true,
    name: '',
  }
}
