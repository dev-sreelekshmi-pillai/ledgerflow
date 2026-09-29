export type AccountType =
  | 'bank'
  | 'cash'
  | 'credit-card'
  | 'investment'
  | 'loan';

export type AccountClassification =
  | 'asset'
  | 'liability';

export interface Account {
  id: string;
  userId: string;

  name: string;
  type: AccountType;

  currency: string;

  openingBalance: number;
  currentBalance: number;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

export function getAccountClassification(
  type: AccountType
): AccountClassification {
  switch (type) {
    case 'credit-card':
    case 'loan':
      return 'liability';

    case 'bank':
    case 'cash':
    case 'investment':
      return 'asset';
  }
}

export function getAccountTypeLabel(
  type: AccountType
): string {
  switch (type) {
    case 'bank':
      return 'Bank Account';

    case 'cash':
      return 'Cash';

    case 'credit-card':
      return 'Credit Card';

    case 'investment':
      return 'Investment';

    case 'loan':
      return 'Loan / Debt';
  }
}
