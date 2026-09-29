import { Transaction } from './transaction.model';

export interface LedgerEffect {
  accountId: string;
  balanceChange: number;
}

export function calculateLedgerEffects(
  transaction: Transaction
): LedgerEffect[] {
  switch (transaction.type) {
    case 'income':
      return [
        {
          accountId: transaction.destinationAccountId!,
          balanceChange: transaction.amount,
        },
      ];

    case 'expense':
      return [
        {
          accountId: transaction.sourceAccountId!,
          balanceChange: -transaction.amount,
        },
      ];

    case 'transfer':
      return [
        {
          accountId: transaction.sourceAccountId!,
          balanceChange: -transaction.amount,
        },
        {
          accountId: transaction.destinationAccountId!,
          balanceChange: transaction.amount,
        },
      ];

    case 'investment':
      return [
        {
          accountId: transaction.sourceAccountId!,
          balanceChange: -transaction.amount,
        },
      ];

    case 'debt-given':
      return [
        {
          accountId: transaction.sourceAccountId!,
          balanceChange: -transaction.amount,
        },
      ];

    case 'debt-received':
      return [
        {
          accountId: transaction.destinationAccountId!,
          balanceChange: transaction.amount,
        },
      ];
    case 'loan-repayment':
      return [
        {
          accountId: transaction.sourceAccountId!,
          balanceChange: -transaction.amount,
        },
        {
          accountId: transaction.destinationAccountId!,
          balanceChange: -transaction.amount,
        },
      ];

    case 'debt-repayment':
      return [];
    case 'credit-card-payment':
      return [
        {
          accountId: transaction.sourceAccountId!,
          balanceChange: -transaction.amount,
        },
        {
          accountId: transaction.destinationAccountId!,
          balanceChange: -transaction.amount,
        },
      ];
  }
}
