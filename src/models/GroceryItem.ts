export interface GroceryItem {
  id?: number;
  name: string;
  expirationDate: string;
  category: string;
  quantity: number;
  unit: string;
  isExpired: boolean;
  daysUntilExpiration: number;
  placement: string;
  active: boolean;
}

export enum ExpirationStatus {
  EXPIRED = 'expired',
  EXPIRING_SOON = 'expiring-soon', // 3 days or less
  GOOD = 'good'
}

export function getExpirationStatus(groceryItem: GroceryItem): ExpirationStatus {
  if (groceryItem.isExpired) {
    return ExpirationStatus.EXPIRED;
  } else if (groceryItem.daysUntilExpiration <= 3) {
    return ExpirationStatus.EXPIRING_SOON;
  } else {
    return ExpirationStatus.GOOD;
  }
}

export function createDefault(): GroceryItem {
  return {
    name: '',
    expirationDate: '',
    category: '',
    quantity: 0,
    unit: '',
    isExpired: false,
    daysUntilExpiration: 0,
    placement: '',
    active: true,
  }
}
