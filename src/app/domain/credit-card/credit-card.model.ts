export interface CreditCard {
  id: string;
  userId: string;

  /**
   * The underlying Account with type = 'credit-card'.
   */
  accountId: string;

  name: string;

  /**
   * Maximum amount that can be outstanding on the card.
   */
  creditLimit: number;

  /**
   * Statement day of the month, 1-31.
   */
  billingDay: number;

  /**
   * Payment due day of the month, 1-31.
   */
  dueDay: number;

  currency: string;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

export function getCreditCardUtilization(
  creditCard: CreditCard,
  outstandingAmount: number
): number {
  if (creditCard.creditLimit <= 0) {
    return 0;
  }

  return (
    (outstandingAmount / creditCard.creditLimit) *
    100
  );
}

export function getCreditCardAvailableLimit(
  creditCard: CreditCard,
  outstandingAmount: number
): number {
  return Math.max(
    creditCard.creditLimit - outstandingAmount,
    0
  );
}
