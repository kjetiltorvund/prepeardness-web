export interface GroceryItem {
  id?: number;
  article_name: string;
  expirationDate: string;
  category: string;
  quantity: number;
  unit: string;
  expired: boolean;
  daysUntilExpiration: number;
  placement: string;
  active: boolean;
}

export enum ExpirationStatus {
  EXPIRED = 'expired',
  EXPIRING_SOON = 'expiring-soon', // 3 days or less
  GOOD = 'good',
  UNKNOWN = 'unknown'
}

export function getExpirationStatus(groceryItem: GroceryItem): ExpirationStatus {
  if (groceryItem.expired) {
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
    expirationDate: '',
    category: '',
    quantity: 0,
    unit: '',
    expired: false,
    daysUntilExpiration: 0,
    placement: '',
    active: true,
  }
}
