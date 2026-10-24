export const USER_ROLES = ['ADMIN', 'SUPERUSER', 'USER'] as const
export type UserRole = (typeof USER_ROLES)[number]

/** Matches AppUserDto from the backend */
export interface User {
  id?: number
  email: string
  role: UserRole
  active: boolean
  name: string | null
}

export interface UserPayload {
  id?: number
  email: string
  role: UserRole
  active: boolean
  name: string | null
}

export function toUserPayload(user: User): UserPayload {
  return {
    id: user.id,
    email: user.email.trim().toLowerCase(),
    role: user.role,
    active: user.active,
    name: user.name?.trim() || null,
  }
}

export function createDefault(): User {
  return {
    email: '',
    role: 'USER',
    active: true,
    name: '',
  }
}
