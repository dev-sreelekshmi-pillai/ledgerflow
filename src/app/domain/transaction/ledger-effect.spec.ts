import {
  calculateLedgerEffects,
} from './ledger-effect';

import { Transaction } from './transaction.model';

describe('calculateLedgerEffects', () => {

  const baseTransaction: Transaction = {
    id: 'transaction-1',
    userId: 'user-1',
    type: 'expense',
    amount: 1000,
    currency: 'INR',
    transactionDate: '2026-09-17',
    description: 'Groceries',
    sourceAccountId: 'account-1',
    destinationAccountId: null,
    categoryId: 'category-1',
    partyId: 'party-1',
    notes: null, investmentId: null, debtId:  null,
    createdAt: '2026-09-17T00:00:00.000Z',
    updatedAt: '2026-09-17T00:00:00.000Z',
  };

  it('should increase the destination account for income', () => {
    const transaction: Transaction = {
      ...baseTransaction,
      type: 'income',
      destinationAccountId: 'account-1',
    };

    expect(
      calculateLedgerEffects(transaction)
    ).toEqual([
      {
        accountId: 'account-1',
        balanceChange: 1000,
      },
    ]);
  });

  it('should decrease the source account for expense', () => {
    const effects =
      calculateLedgerEffects(baseTransaction);

    expect(effects).toEqual([
      {
        accountId: 'account-1',
        balanceChange: -1000,
      },
    ]);
  });

  it('should move money between accounts for transfer', () => {
    const transaction: Transaction = {
      ...baseTransaction,
      type: 'transfer',
      destinationAccountId: 'account-2',
    };

    expect(
      calculateLedgerEffects(transaction)
    ).toEqual([
      {
        accountId: 'account-1',
        balanceChange: -1000,
      },
      {
        accountId: 'account-2',
        balanceChange: 1000,
      },
    ]);
  });
  it('should deduct investment amount from the funding account', () => {
    const transaction: Transaction = {
      ...baseTransaction,
      type: 'investment',
      sourceAccountId: 'bank-1',
      destinationAccountId: null,
      investmentId: 'investment-1',
    };

    expect(
      calculateLedgerEffects(transaction)
    ).toEqual([
      {
        accountId: 'bank-1',
        balanceChange: -1000,
      },
    ]);
  });

  it('should reduce the source account for debt given', () => {
    const transaction: Transaction = {
      ...baseTransaction,
      type: 'debt-given',
      sourceAccountId: 'bank-1',
      destinationAccountId: null,
      debtId: 'debt-1',
    };

    expect(calculateLedgerEffects(transaction)).toEqual([
      {
        accountId: 'bank-1',
        balanceChange: -1000,
      },
    ]);
  });
  it('should increase the destination account for debt received', () => {
    const transaction: Transaction = {
      ...baseTransaction,
      type: 'debt-received',
      destinationAccountId: 'account-1',
    };

    expect(
      calculateLedgerEffects(transaction)
    ).toEqual([
      {
        accountId: 'account-1',
        balanceChange: 1000,
      },
    ]);
  });

  it('should decrease both source and loan liability for loan repayment', () => {
    const transaction: Transaction = {
      ...baseTransaction,
      type: 'loan-repayment',
      destinationAccountId: 'loan-1',
    };

    expect(
      calculateLedgerEffects(transaction)
    ).toEqual([
      {
        accountId: 'account-1',
        balanceChange: -1000,
      },
      {
        accountId: 'loan-1',
        balanceChange: -1000,
      },
    ]);
  });

});
