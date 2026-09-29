import { validateTransaction } from './transaction-validator';
import { Transaction } from './transaction.model';

describe('validateTransaction', () => {

  const validExpense: Transaction = {
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
    notes: null, investmentId: null, debtId: null,
    createdAt: '2026-09-17T00:00:00.000Z',
    updatedAt: '2026-09-17T00:00:00.000Z',
  };

  it('should accept a valid transaction', () => {
    expect(() =>
      validateTransaction(validExpense)
    ).not.toThrow();
  });

  it('should reject zero amount', () => {
    expect(() =>
      validateTransaction({
        ...validExpense,
        amount: 0,
      })
    ).toThrowError(
      /Transaction amount must be greater than zero/
    );
  });

  it('should reject negative amount', () => {
    expect(() =>
      validateTransaction({
        ...validExpense,
        amount: -100,
      })
    ).toThrowError(
      /Transaction amount must be greater than zero/
    );
  });

  it('should require a source account for expenses', () => {
    expect(() =>
      validateTransaction({
        ...validExpense,
        sourceAccountId: '',
      })
    ).toThrowError(
      /Source account is required for this transaction/
    );
  });

  it('should require a destination account for income', () => {
    expect(() =>
      validateTransaction({
        ...validExpense,
        type: 'income',
        sourceAccountId: '',
        destinationAccountId: null,
      })
    ).toThrowError(
      /Destination account is required for this transaction/
    );
  });

  it('should require both accounts for transfers', () => {
    expect(() =>
      validateTransaction({
        ...validExpense,
        type: 'transfer',
        destinationAccountId: null,
      })
    ).toThrowError(
      /Destination account is required for this transaction/
    );
  });

  it('should reject the same source and destination account', () => {
    expect(() =>
      validateTransaction({
        ...validExpense,
        type: 'transfer',
        destinationAccountId: 'account-1',
      })
    ).toThrowError(
      /Source and destination accounts must be different/
    );
  });

  it('should require a description', () => {
    expect(() =>
      validateTransaction({
        ...validExpense,
        description: '   ',
      })
    ).toThrowError(
      /Transaction description is required/
    );
  });

  it('should require currency', () => {
    expect(() =>
      validateTransaction({
        ...validExpense,
        currency: '',
      })
    ).toThrowError(
      /Transaction currency is required/
    );
  });

});
