import {
  processTransaction,
} from './ledger-engine';

import { Transaction } from './transaction.model';

describe('processTransaction', () => {

  const baseTransaction: Transaction = {
    id: 'transaction-1',
    userId: 'user-1',
    type: 'expense',
    amount: 2000,
    currency: 'INR',
    transactionDate: '2026-09-17',
    description: 'Groceries',
    sourceAccountId: 'account-1',
    destinationAccountId: null,
    categoryId: 'category-1',
    partyId: 'party-1',
    notes: null, investmentId: null, debtId: null,
    createdAt: '2026-09-17T00:00:00.000Z',
    updatedAt: '2026-09-17T00:00:00.000Z',
  };

  it('should process a valid expense', () => {
    const result =
      processTransaction(baseTransaction);

    expect(result.transaction)
      .toEqual(baseTransaction);

    expect(result.effects)
      .toEqual([
        {
          accountId: 'account-1',
          balanceChange: -2000,
        },
      ]);
  });

  it('should process income', () => {
    const transaction: Transaction = {
      ...baseTransaction,
      type: 'income',
      sourceAccountId: '',
      destinationAccountId: 'account-1',
      categoryId: null,
      partyId: 'employer',
    };

    const result =
      processTransaction(transaction);

    expect(result.effects)
      .toEqual([
        {
          accountId: 'account-1',
          balanceChange: 2000,
        },
      ]);
  });

  it('should process a transfer', () => {
    const transaction: Transaction = {
      ...baseTransaction,
      type: 'transfer',
      destinationAccountId: 'account-2',
      categoryId: null,
      partyId: null,
    };

    const result =
      processTransaction(transaction);

    expect(result.effects)
      .toEqual([
        {
          accountId: 'account-1',
          balanceChange: -2000,
        },
        {
          accountId: 'account-2',
          balanceChange: 2000,
        },
      ]);
  });

  it('should reject an invalid transaction', () => {
    const transaction: Transaction = {
      ...baseTransaction,
      amount: 0,
    };

    expect(() =>
      processTransaction(transaction)
    ).toThrowError(
      /Transaction amount must be greater than zero/
    );
  });

  it('should reject a transfer to the same account', () => {
    const transaction: Transaction = {
      ...baseTransaction,
      type: 'transfer',
      destinationAccountId: 'account-1',
      categoryId: null,
      partyId: null,
    };

    expect(() =>
      processTransaction(transaction)
    ).toThrowError(
      /Source and destination accounts must be different/
    );
  });

});
