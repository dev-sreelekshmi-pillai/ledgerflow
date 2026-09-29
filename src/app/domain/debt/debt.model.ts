export type DebtDirection =
  | 'lent'
  | 'borrowed';

export type DebtStatus =
  | 'active'
  | 'settled'
  | 'cancelled';

export interface Debt {
  id: string;
  userId: string;

  partyId: string;

  direction: DebtDirection;

  principalAmount: number;
  outstandingAmount: number;

  startDate: string;
  currency: string;

  status: DebtStatus;

  notes: string | null;
  accountId: string;
  createdAt: string;
  updatedAt: string;
}

export function getDebtDirectionLabel(
  direction: DebtDirection
): string {
  switch (direction) {
    case 'lent':
      return 'Money Lent';

    case 'borrowed':
      return 'Money Borrowed';
  }
}

export function getDebtStatusLabel(
  status: DebtStatus
): string {
  switch (status) {
    case 'active':
      return 'Active';

    case 'settled':
      return 'Settled';

    case 'cancelled':
      return 'Cancelled';
  }
}

export function getDebtOutstandingPercentage(
  debt: Debt
): number {
  if (debt.principalAmount <= 0) {
    return 0;
  }

  return (
    (debt.outstandingAmount / debt.principalAmount) * 100
  );
}

export function isDebtSettled(
  debt: Debt
): boolean {
  return debt.outstandingAmount <= 0;
}
