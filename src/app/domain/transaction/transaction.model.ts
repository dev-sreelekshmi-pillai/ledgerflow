export type TransactionType =
  | 'income'
  | 'expense'
  | 'transfer'
  | 'investment'
  | 'debt-given'
  | 'debt-received'
  | 'debt-repayment'
  | 'loan-repayment'
  | 'credit-card-payment';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  transactionDate: string;
  description: string;

  sourceAccountId: string | null;
  destinationAccountId: string | null;

  categoryId: string | null;
  partyId: string | null;

  investmentId: string | null;
  debtId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
export type TransactionClassification =
  | 'income'
  | 'expense'
  | 'transfer';


export function getTransactionClassification(
  type: TransactionType
): TransactionClassification {
  switch (type) {
    case 'income':
      return 'income';
    case 'expense':
      return 'expense';
    case 'transfer':
    case 'investment':
    case 'debt-received':
    case 'debt-given':
    case 'debt-repayment':
    case 'loan-repayment':
      return 'transfer';
    case 'credit-card-payment':
      return 'transfer';
  }
}

export function getTransactionTypeLabel(
  type: TransactionType
): string {
  switch (type) {
    case 'income':
      return 'Income';

    case 'expense':
      return 'Expense';

    case 'transfer':
      return 'Transfer';

    case 'investment':
      return 'Investment';

    case 'debt-given':
      return 'Debt Given';

    case 'debt-received':
      return 'Debt Received';
    case 'debt-repayment':
      return 'Debt Repayment';

    case 'loan-repayment':
      return 'Loan Repayment';
    case 'credit-card-payment':
      return 'Credit Card Payment';
  }
}
