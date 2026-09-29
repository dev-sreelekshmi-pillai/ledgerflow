import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';

import { TransactionStore } from './transaction.store';
import { AuthService } from '../../core/auth/auth.service';
import { TransactionRepository } from '../../infrastructure/repositories/transaction.repository';
import { Transaction } from '../../domain/transaction/transaction.model';

describe('TransactionStore', () => {
  let store: TransactionStore;

  const currentUserSignal = signal<any>(null);
  const userSubject = new BehaviorSubject<any>(null);

  const authServiceMock = {
    currentUser: currentUserSignal,
    user$: userSubject.asObservable(),
  };

  const transactionRepositoryMock = {
    getAll: jasmine.createSpy('getAll'),
    create: jasmine.createSpy('create'),
  };

  const transactions: Transaction[] = [
    {
      id: 'transaction-1',
      userId: 'user-1',
      type: 'income',
      amount: 68000,
      currency: 'INR',
      transactionDate: '2026-09-01',
      description: 'Salary',
      sourceAccountId: '',
      destinationAccountId: 'account-1',
      categoryId: null,
      partyId: null,
      notes: null, investmentId: null, debtId: null,
      createdAt: '2026-09-01T09:00:00.000Z',
      updatedAt: '2026-09-01T09:00:00.000Z',
    },
    {
      id: 'transaction-2',
      userId: 'user-1',
      type: 'expense',
      amount: 2500,
      currency: 'INR',
      transactionDate: '2026-09-02',
      description: 'Groceries',
      sourceAccountId: 'account-1',
      destinationAccountId: null,
      categoryId: 'category-1',
      partyId: null,
      notes: null, investmentId: null, debtId: null,
      createdAt: '2026-09-02T09:00:00.000Z',
      updatedAt: '2026-09-02T09:00:00.000Z',
    },
    {
      id: 'transaction-3',
      userId: 'user-1',
      type: 'expense',
      amount: 1500,
      currency: 'INR',
      transactionDate: '2026-09-03',
      description: 'Transport',
      sourceAccountId: 'account-1',
      destinationAccountId: null,
      categoryId: 'category-2',
      partyId: null,
      notes: null, investmentId: null, debtId: null,
      createdAt: '2026-09-03T09:00:00.000Z',
      updatedAt: '2026-09-03T09:00:00.000Z',
    },
    {
      id: 'transaction-4',
      userId: 'user-1',
      type: 'transfer',
      amount: 5000,
      currency: 'INR',
      transactionDate: '2026-09-04',
      description: 'Transfer to savings',
      sourceAccountId: 'account-1',
      destinationAccountId: 'account-2',
      categoryId: null,
      partyId: null,
      notes: null, investmentId: null, debtId: null,
      createdAt: '2026-09-04T09:00:00.000Z',
      updatedAt: '2026-09-04T09:00:00.000Z',
    },
  ];

  beforeEach(() => {
    currentUserSignal.set(null);
    userSubject.next(null);

    transactionRepositoryMock.getAll.calls.reset();
    transactionRepositoryMock.create.calls.reset();

    transactionRepositoryMock.getAll.and.returnValue(
      of([])
    );

    transactionRepositoryMock.create.and.returnValue(
      Promise.resolve()
    );

    TestBed.configureTestingModule({
      providers: [
        TransactionStore,
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: TransactionRepository,
          useValue: transactionRepositoryMock,
        },
      ],
    });

    store = TestBed.inject(TransactionStore);
  });

  it('should create', () => {
    expect(store).toBeTruthy();
  });

  it('should have no current user when unauthenticated', () => {
    expect(store.currentUser()).toBeNull();
  });

  it('should return empty transactions when unauthenticated', () => {
    expect(store.transactions()).toEqual([]);
    expect(store.transactionCount()).toBe(0);
  });

  it('should load transactions for the authenticated user', () => {
    transactionRepositoryMock.getAll.and.returnValue(
      of(transactions)
    );

    currentUserSignal.set({
      uid: 'user-1',
    });

    userSubject.next({
      uid: 'user-1',
    });

    expect(
      transactionRepositoryMock.getAll
    ).toHaveBeenCalledWith('user-1');

    expect(store.transactions()).toEqual(
      transactions
    );
  });

  it('should calculate transaction count', () => {
    transactionRepositoryMock.getAll.and.returnValue(
      of(transactions)
    );

    currentUserSignal.set({
      uid: 'user-1',
    });

    userSubject.next({
      uid: 'user-1',
    });

    expect(store.transactionCount()).toBe(4);
  });

  it('should calculate total income', () => {
    transactionRepositoryMock.getAll.and.returnValue(
      of(transactions)
    );

    currentUserSignal.set({
      uid: 'user-1',
    });

    userSubject.next({
      uid: 'user-1',
    });

    expect(store.totalIncome()).toBe(68000);
  });

  it('should calculate total expenses', () => {
    transactionRepositoryMock.getAll.and.returnValue(
      of(transactions)
    );

    currentUserSignal.set({
      uid: 'user-1',
    });

    userSubject.next({
      uid: 'user-1',
    });

    expect(store.totalExpenses()).toBe(4000);
  });

  it('should calculate net cash flow', () => {
    transactionRepositoryMock.getAll.and.returnValue(
      of(transactions)
    );

    currentUserSignal.set({
      uid: 'user-1',
    });

    userSubject.next({
      uid: 'user-1',
    });

    expect(store.netCashFlow()).toBe(64000);
  });

  it('should create a transaction for the authenticated user', async () => {
    currentUserSignal.set({
      uid: 'user-1',
    });

    userSubject.next({
      uid: 'user-1',
    });

    const transaction = transactions[0];

    await store.createTransaction(transaction);

    expect(
      transactionRepositoryMock.create
    ).toHaveBeenCalledWith(transaction);
  });

  it('should reject transaction creation when user is unauthenticated', async () => {
    currentUserSignal.set(null);
    userSubject.next(null);

    await expectAsync(
      store.createTransaction(transactions[0])
    ).toBeRejectedWithError(
      'User is not authenticated.'
    );

    expect(
      transactionRepositoryMock.create
    ).not.toHaveBeenCalled();
  });

  it('should reject transaction belonging to another user', async () => {
    currentUserSignal.set({
      uid: 'user-1',
    });

    userSubject.next({
      uid: 'user-1',
    });

    const transactionForAnotherUser = {
      ...transactions[0],
      userId: 'user-2',
    };

    await expectAsync(
      store.createTransaction(
        transactionForAnotherUser
      )
    ).toBeRejectedWithError(
      'Cannot create a transaction for another user.'
    );

    expect(
      transactionRepositoryMock.create
    ).not.toHaveBeenCalled();
  });
});
