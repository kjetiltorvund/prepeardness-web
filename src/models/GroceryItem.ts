export interface GroceryItem {
  id?: number;
  barcode?: string | null;
  created_at?: string | null;
  qr_code?: string | null;
  article_name: string;
  expiration_date: string | null;
  category: string;
  quantity: number;
  unit: string;
  expired: boolean;
  daysUntilExpiration: number;
  placement: string;
  active: boolean;
  replaced: boolean;
}

export interface GroceryPayload {
  id?: number
  barcode: string | null
  active: boolean
  expired: boolean
  placement: string | null
  article_name: string
  created_at: string | null
  expiration_date: string | null
  qr_code: string | null
}

/** Response from POST /items. Expired items with the same barcode are removed by the backend. */
export interface CreateGroceryResponse {
  article: GroceryItem
  replaced_ids: number[]
}

export function toGroceryPayload(item: GroceryItem): GroceryPayload {
  return {
    id: item.id,
    barcode: item.barcode ?? null,
    active: item.active,
    expired: item.expired,
    placement: item.placement || null,
    article_name: item.article_name,
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

export function getExpirationStatus(groceryItem: GroceryItem): ExpirationStatus {
  if (!groceryItem.expiration_date) {
    return ExpirationStatus.UNKNOWN;
  } else if (groceryItem.expired) {
    return ExpirationStatus.EXPIRED;
  } else if (groceryItem.daysUntilExpiration <= 3) {
    return ExpirationStatus.EXPIRING_SOON;
  } else {
    return ExpirationStatus.GOOD;
  }
}

export function createDefault(): GroceryItem {
  return {
    article_name: '',
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
