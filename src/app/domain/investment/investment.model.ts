export type InvestmentType =
  | 'mutual-fund'
  | 'stock'
  | 'etf'
  | 'gold'
  | 'fixed-deposit'
  | 'other';

export interface Investment {
  id: string;
  userId: string;
  name: string;
  type: InvestmentType;
  accountId: string;
  investedAmount: number;
  currentValue: number;
  units: number | null;
  purchaseDate: string;
  notes: string | null;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function getInvestmentGainLoss(
  investment: Investment
): number {
  return investment.currentValue - investment.investedAmount;
}

export function getInvestmentReturnPercentage(
  investment: Investment
): number {
  if (investment.investedAmount <= 0) {
    return 0;
  }

  return (
    (getInvestmentGainLoss(investment) /
      investment.investedAmount) *
    100
  );
}
