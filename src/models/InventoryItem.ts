export interface InventoryItem {
  id?: number;
  barcode?: string | null;
  created_at?: string | null;
  qr_code?: string | null;
  name: string;
  expiration_date: string | null;
  category: string;
  quantity: number;
  unit: string;
  expired: boolean;
  daysUntilExpiration: number;
  placement: string;
  active: boolean;
  replaced?: boolean;
}

export interface InventoryItemPayload {
  id?: number
  barcode: string | null
  active: boolean
  expired: boolean
  placement: string | null
  name: string
  created_at: string | null
  expiration_date: string | null
  qr_code: string | null
}

/** Response from POST /items. Expired items with the same barcode are removed by the backend. */
export interface CreateItemResponse {
  item: InventoryItem
  replaced_ids: number[]
}

export function toInventoryItemPayload(item: InventoryItem): InventoryItemPayload {
  return {
    id: item.id,
    barcode: item.barcode ?? null,
    active: item.active,
    expired: item.expired,
    placement: item.placement || null,
    name: item.name,
    created_at: item.created_at ?? null,
    expiration_date: item.expiration_date || null,
    qr_code: item.qr_code ?? null,
  }
}

export enum ExpirationStatus {
  EXPIRED = 'expired',
  EXPIRING_SOON = 'expiring-soon', // 3 days or less
  GOOD = 'good',
  UNKNOWN = 'unknown'
}

export function getExpirationStatus(item: InventoryItem): ExpirationStatus {
  if (!item.expiration_date) {
    return ExpirationStatus.UNKNOWN;
  } else if (item.expired) {
    return ExpirationStatus.EXPIRED;
  } else if (item.daysUntilExpiration <= 3) {
    return ExpirationStatus.EXPIRING_SOON;
  } else {
    return ExpirationStatus.GOOD;
  }
}

export function createDefault(): InventoryItem {
  return {
    name: '',
    expiration_date: null,
    category: '',
    quantity: 0,
    unit: '',
    expired: false,
    daysUntilExpiration: 0,
    placement: '',
    active: true,
  }
}
