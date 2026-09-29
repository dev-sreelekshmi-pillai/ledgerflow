import { Transaction } from './transaction.model';

export function validateTransaction(
  transaction: Transaction
): void {
  if (transaction.amount <= 0) {
    throw new Error(
      'Transaction amount must be greater than zero.'
    );
  }

  if (!transaction.userId) {
    throw new Error(
      'Transaction must belong to a user.'
    );
  }

  if (!transaction.currency) {
    throw new Error(
      'Transaction currency is required.'
    );
  }

  if (!transaction.transactionDate) {
    throw new Error(
      'Transaction date is required.'
    );
  }

  if (!transaction.description.trim()) {
    throw new Error(
      'Transaction description is required.'
    );
  }

  const requiresSource = [
    'expense',
    'transfer',
    'investment',
    'debt-given',
    'loan-repayment', 'credit-card-payment',
  ].includes(transaction.type);

  const requiresDestination = [
    'income',
    'transfer',
    'debt-received',
    'loan-repayment', 'credit-card-payment',
  ].includes(transaction.type);
  if (
    transaction.type === 'investment' &&
    !transaction.investmentId
  ) {
    throw new Error(
      'Investment requires an investment.'
    );
  }
  if (
    requiresSource &&
    !transaction.sourceAccountId
  ) {
    throw new Error(
      'Source account is required for this transaction.'
    );
  }

  if (
    requiresDestination &&
    !transaction.destinationAccountId
  ) {
    throw new Error(
      'Destination account is required for this transaction.'
    );
  }

  if (
    transaction.sourceAccountId &&
    transaction.destinationAccountId &&
    transaction.sourceAccountId ===
    transaction.destinationAccountId
  ) {
    throw new Error(
      'Source and destination accounts must be different.'
    );
  } if (
    [
      'debt-given',
      'debt-received',
      'debt-repayment',
    ].includes(transaction.type) &&
    !transaction.debtId
  ) {
    throw new Error(
      'Debt transaction requires a debt.'
    );
  }
}
