import {
  TestBed,
} from '@angular/core/testing';

import {
  Firestore,
  doc,
  runTransaction,
} from '@angular/fire/firestore';

import { TransactionRepository } from './transaction.repository';
import { FirestoreTransactionService } from '../firebase/firestore-transaction.service';
import { Transaction } from '../../domain/transaction/transaction.model';

describe('TransactionRepository', () => {
  let repository: TransactionRepository;

  const firestoreMock = {};

  const firestoreTransactionMock = {
    get: jasmine.createSpy('get'),
    set: jasmine.createSpy('set'),
    update: jasmine.createSpy('update'),
    delete: jasmine.createSpy('delete'),
  };

  const firestoreTransactionServiceMock = {
    run: jasmine
      .createSpy('run'),

    doc: jasmine
      .createSpy('doc')
      .and.callFake((path: string) => path),
  };

  beforeEach(() => {
    firestoreTransactionMock.get.calls.reset();
    firestoreTransactionMock.set.calls.reset();
    firestoreTransactionMock.update.calls.reset();
    firestoreTransactionMock.delete.calls.reset();

    firestoreTransactionServiceMock.run.calls.reset();
    firestoreTransactionServiceMock.doc.calls.reset();

    TestBed.configureTestingModule({
      providers: [
        TransactionRepository,

        {
          provide: Firestore,
          useValue: firestoreMock,
        },
        {
          provide: FirestoreTransactionService,
          useValue: firestoreTransactionServiceMock,
        },
      ],
    });

    repository =
      TestBed.inject(TransactionRepository);
  });

  it('should create', () => {
    expect(repository).toBeTruthy();
  });

  it('should process an expense and update the source account balance', async () => {
    const transaction: Transaction = {
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

    const accountSnapshot = {
      exists: () => true,
      data: () => ({
        currentBalance: 50000,
      }),
    };

    firestoreTransactionServiceMock.run.and.callFake(
      async (operation: any) => {
        await operation(firestoreTransactionMock);
      }
    );

    firestoreTransactionMock.get.and.resolveTo(
      accountSnapshot
    );

    await repository.create(transaction);

    expect(
      firestoreTransactionMock.get
    ).toHaveBeenCalled();

    expect(
      firestoreTransactionMock.update
    ).toHaveBeenCalledWith(
      jasmine.anything(),
      {
        currentBalance: 48000,
        updatedAt: jasmine.any(String),
      }
    );

    expect(
      firestoreTransactionMock.set
    ).toHaveBeenCalledWith(
      jasmine.anything(),
      transaction
    );
  });

  it('should process income and update the destination account balance', async () => {
    const transaction: Transaction = {
      id: 'income-1',
      userId: 'user-1',
      type: 'income',
      amount: 10000,
      currency: 'INR',
      transactionDate: '2026-09-17',
      description: 'Salary',
      sourceAccountId: '',
      destinationAccountId: 'account-1',
      categoryId: null,
      partyId: 'employer-1',
      notes: null, investmentId: null, debtId: null,
      createdAt: '2026-09-17T00:00:00.000Z',
      updatedAt: '2026-09-17T00:00:00.000Z',
    };

    const accountSnapshot = {
      exists: () => true,
      data: () => ({
        currentBalance: 50000,
      }),
    };

    firestoreTransactionServiceMock.run.and.callFake(
      async (operation: any) => {
        await operation(firestoreTransactionMock);
      }
    );

    firestoreTransactionServiceMock.doc.and.callFake(
      (path: string) => path
    );

    firestoreTransactionMock.get.and.resolveTo(
      accountSnapshot
    );

    await repository.create(transaction);

    expect(
      firestoreTransactionMock.update
    ).toHaveBeenCalledWith(
      'users/user-1/accounts/account-1',
      {
        currentBalance: 60000,
        updatedAt: jasmine.any(String),
      }
    );

    expect(
      firestoreTransactionMock.set
    ).toHaveBeenCalledWith(
      'users/user-1/transactions/income-1',
      transaction
    );
  });

  it('should process a transfer and update both account balances', async () => {
    const transaction: Transaction = {
      id: 'transfer-1',
      userId: 'user-1',
      type: 'transfer',
      amount: 10000,
      currency: 'INR',
      transactionDate: '2026-09-17',
      description: 'Move money to SBI',
      sourceAccountId: 'account-1',
      destinationAccountId: 'account-2',
      categoryId: null,
      partyId: null,
      notes: null,
      investmentId: null, debtId: null,
      createdAt: '2026-09-17T00:00:00.000Z',
      updatedAt: '2026-09-17T00:00:00.000Z',
    };

    const accountSnapshots = [
      {
        exists: () => true,
        data: () => ({
          currentBalance: 50000,
        }),
      },
      {
        exists: () => true,
        data: () => ({
          currentBalance: 20000,
        }),
      },
    ];

    let getCall = 0;

    firestoreTransactionServiceMock.run.and.callFake(
      async (operation: any) => {
        await operation(firestoreTransactionMock);
      }
    );

    firestoreTransactionServiceMock.doc.and.callFake(
      (path: string) => path
    );

    firestoreTransactionMock.get.and.callFake(
      async () => accountSnapshots[getCall++]
    );

    await repository.create(transaction);

    expect(
      firestoreTransactionMock.update
    ).toHaveBeenCalledWith(
      'users/user-1/accounts/account-1',
      {
        currentBalance: 40000,
        updatedAt: jasmine.any(String),
      }
    );

    expect(
      firestoreTransactionMock.update
    ).toHaveBeenCalledWith(
      'users/user-1/accounts/account-2',
      {
        currentBalance: 30000,
        updatedAt: jasmine.any(String),
      }
    );

    expect(
      firestoreTransactionMock.update
    ).toHaveBeenCalledTimes(2);

    expect(
      firestoreTransactionMock.set
    ).toHaveBeenCalledWith(
      'users/user-1/transactions/transfer-1',
      transaction
    );
  });

  it('should reject when an affected account does not exist', async () => {
    const transaction: Transaction = {
      id: 'transaction-missing-account',
      userId: 'user-1',
      type: 'expense',
      amount: 2000,
      currency: 'INR',
      transactionDate: '2026-09-17',
      description: 'Groceries',
      sourceAccountId: 'missing-account',
      destinationAccountId: null,
      categoryId: 'category-1',
      partyId: 'party-1',
      notes: null, investmentId: null, debtId: null,
      createdAt: '2026-09-17T00:00:00.000Z',
      updatedAt: '2026-09-17T00:00:00.000Z',
    };

    firestoreTransactionServiceMock.run.and.callFake(
      async (operation: any) => {
        await operation(firestoreTransactionMock);
      }
    );

    firestoreTransactionServiceMock.doc.and.callFake(
      (path: string) => path
    );

    firestoreTransactionMock.get.and.resolveTo({
      exists: () => false,
      data: () => undefined,
    });

    await expectAsync(
      repository.create(transaction)
    ).toBeRejectedWithError(
      /Account missing-account was not found/
    );

    expect(
      firestoreTransactionMock.set
    ).not.toHaveBeenCalled();

    expect(
      firestoreTransactionMock.update
    ).not.toHaveBeenCalled();
  });

  it('should reject when an account has an invalid balance', async () => {
    const transaction: Transaction = {
      id: 'transaction-invalid-balance',
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

    firestoreTransactionServiceMock.run.and.callFake(
      async (operation: any) => {
        await operation(firestoreTransactionMock);
      }
    );

    firestoreTransactionServiceMock.doc.and.callFake(
      (path: string) => path
    );

    firestoreTransactionMock.get.and.resolveTo({
      exists: () => true,
      data: () => ({
        currentBalance: '50000',
      }),
    });

    await expectAsync(
      repository.create(transaction)
    ).toBeRejectedWithError(
      /Account account-1 has an invalid balance/
    );

    expect(
      firestoreTransactionMock.set
    ).not.toHaveBeenCalled();

    expect(
      firestoreTransactionMock.update
    ).not.toHaveBeenCalled();
  });

  it('should reject an invalid transaction before writing to Firestore', async () => {
    const transaction: Transaction = {
      id: 'invalid-transaction',
      userId: 'user-1',
      type: 'expense',
      amount: 0,
      currency: 'INR',
      transactionDate: '2026-09-17',
      description: 'Invalid expense',
      sourceAccountId: 'account-1',
      destinationAccountId: null,
      categoryId: null,
      partyId: null,
      notes: null, investmentId: null, debtId: null,
      createdAt: '2026-09-17T00:00:00.000Z',
      updatedAt: '2026-09-17T00:00:00.000Z',
    };

    await expectAsync(
      repository.create(transaction)
    ).toBeRejectedWithError(
      /Transaction amount must be greater than zero/
    );

    expect(
      firestoreTransactionServiceMock.run
    ).not.toHaveBeenCalled();

    expect(
      firestoreTransactionMock.set
    ).not.toHaveBeenCalled();

    expect(
      firestoreTransactionMock.update
    ).not.toHaveBeenCalled();
  });

  it('should update an expense and apply only the net balance change', async () => {
    const oldTransaction: Transaction = {
      id: 'expense-1',
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
      notes: null,
      investmentId: null,
      debtId: null,
      createdAt: '2026-09-17T00:00:00.000Z',
      updatedAt: '2026-09-17T00:00:00.000Z',
    };

    const updatedTransaction: Transaction = {
      ...oldTransaction,
      amount: 3000,
      updatedAt: '2026-09-18T00:00:00.000Z',
    };

    firestoreTransactionServiceMock.run.and.callFake(
      async (operation: any) => {
        await operation(firestoreTransactionMock);
      }
    );

    firestoreTransactionMock.get.and.callFake(
      async (ref: string) => {
        if (
          ref ===
          'users/user-1/transactions/expense-1'
        ) {
          return {
            exists: () => true,
            data: () => oldTransaction,
          };
        }

        return {
          exists: () => true,
          data: () => ({
            currentBalance: 50000,
          }),
        };
      }
    );

    await repository.update(
      'user-1',
      'expense-1',
      updatedTransaction
    );

    expect(
      firestoreTransactionMock.update
    ).toHaveBeenCalledWith(
      'users/user-1/accounts/account-1',
      {
        currentBalance: 49000,
        updatedAt: jasmine.any(String),
      }
    );

    expect(
      firestoreTransactionMock.set
    ).toHaveBeenCalledWith(
      'users/user-1/transactions/expense-1',
      updatedTransaction
    );
  });

  it('should update an income and apply only the net balance change', async () => {
    const oldTransaction: Transaction = {
      id: 'income-1',
      userId: 'user-1',
      type: 'income',
      amount: 10000,
      currency: 'INR',
      transactionDate: '2026-09-17',
      description: 'Salary',
      sourceAccountId: '',
      destinationAccountId: 'account-1',
      categoryId: null,
      partyId: 'employer-1',
      notes: null,
      investmentId: null,
      debtId: null,
      createdAt: '2026-09-17T00:00:00.000Z',
      updatedAt: '2026-09-17T00:00:00.000Z',
    };

    const updatedTransaction: Transaction = {
      ...oldTransaction,
      amount: 12000,
      updatedAt: '2026-09-18T00:00:00.000Z',
    };

    firestoreTransactionServiceMock.run.and.callFake(
      async (operation: any) => {
        await operation(firestoreTransactionMock);
      }
    );

    firestoreTransactionMock.get.and.callFake(
      async (ref: string) => {
        if (
          ref ===
          'users/user-1/transactions/income-1'
        ) {
          return {
            exists: () => true,
            data: () => oldTransaction,
          };
        }

        return {
          exists: () => true,
          data: () => ({
            currentBalance: 50000,
          }),
        };
      }
    );

    await repository.update(
      'user-1',
      'income-1',
      updatedTransaction
    );

    expect(
      firestoreTransactionMock.update
    ).toHaveBeenCalledWith(
      'users/user-1/accounts/account-1',
      {
        currentBalance: 52000,
        updatedAt: jasmine.any(String),
      }
    );

    expect(
      firestoreTransactionMock.set
    ).toHaveBeenCalledWith(
      'users/user-1/transactions/income-1',
      updatedTransaction
    );
  });

  it('should update a transfer when the amount changes', async () => {
    const oldTransaction: Transaction = {
      id: 'transfer-1',
      userId: 'user-1',
      type: 'transfer',
      amount: 10000,
      currency: 'INR',
      transactionDate: '2026-09-17',
      description: 'Move money',
      sourceAccountId: 'account-1',
      destinationAccountId: 'account-2',
      categoryId: null,
      partyId: null,
      notes: null,
      investmentId: null,
      debtId: null,
      createdAt: '2026-09-17T00:00:00.000Z',
      updatedAt: '2026-09-17T00:00:00.000Z',
    };

    const updatedTransaction: Transaction = {
      ...oldTransaction,
      amount: 7000,
      updatedAt: '2026-09-18T00:00:00.000Z',
    };

    firestoreTransactionServiceMock.run.and.callFake(
      async (operation: any) => {
        await operation(firestoreTransactionMock);
      }
    );

    firestoreTransactionMock.get.and.callFake(
      async (ref: string) => {
        if (
          ref ===
          'users/user-1/transactions/transfer-1'
        ) {
          return {
            exists: () => true,
            data: () => oldTransaction,
          };
        }

        return {
          exists: () => true,
          data: () => ({
            currentBalance:
              ref.endsWith('account-1')
                ? 50000
                : 20000,
          }),
        };
      }
    );

    await repository.update(
      'user-1',
      'transfer-1',
      updatedTransaction
    );

    expect(
      firestoreTransactionMock.update
    ).toHaveBeenCalledWith(
      'users/user-1/accounts/account-1',
      {
        currentBalance: 53000,
        updatedAt: jasmine.any(String),
      }
    );

    expect(
      firestoreTransactionMock.update
    ).toHaveBeenCalledWith(
      'users/user-1/accounts/account-2',
      {
        currentBalance: 17000,
        updatedAt: jasmine.any(String),
      }
    );

    expect(
      firestoreTransactionMock.update
    ).toHaveBeenCalledTimes(2);

    expect(
      firestoreTransactionMock.set
    ).toHaveBeenCalledWith(
      'users/user-1/transactions/transfer-1',
      updatedTransaction
    );
  });

  it('should update a transfer when the source and destination change', async () => {
    const oldTransaction: Transaction = {
      id: 'transfer-2',
      userId: 'user-1',
      type: 'transfer',
      amount: 10000,
      currency: 'INR',
      transactionDate: '2026-09-17',
      description: 'Move money',
      sourceAccountId: 'account-1',
      destinationAccountId: 'account-2',
      categoryId: null,
      partyId: null,
      notes: null,
      investmentId: null,
      debtId: null,
      createdAt: '2026-09-17T00:00:00.000Z',
      updatedAt: '2026-09-17T00:00:00.000Z',
    };

    const updatedTransaction: Transaction = {
      ...oldTransaction,
      amount: 7000,
      sourceAccountId: 'account-3',
      destinationAccountId: 'account-4',
      updatedAt: '2026-09-18T00:00:00.000Z',
    };

    firestoreTransactionServiceMock.run.and.callFake(
      async (operation: any) => {
        await operation(firestoreTransactionMock);
      }
    );

    firestoreTransactionMock.get.and.callFake(
      async (ref: string) => {
        if (
          ref ===
          'users/user-1/transactions/transfer-2'
        ) {
          return {
            exists: () => true,
            data: () => oldTransaction,
          };
        }

        const balances: Record<string, number> = {
          'users/user-1/accounts/account-1': 50000,
          'users/user-1/accounts/account-2': 20000,
          'users/user-1/accounts/account-3': 30000,
          'users/user-1/accounts/account-4': 10000,
        };

        return {
          exists: () => true,
          data: () => ({
            currentBalance: balances[ref],
          }),
        };
      }
    );

    await repository.update(
      'user-1',
      'transfer-2',
      updatedTransaction
    );

    expect(
      firestoreTransactionMock.update
    ).toHaveBeenCalledWith(
      'users/user-1/accounts/account-1',
      {
        currentBalance: 60000,
        updatedAt: jasmine.any(String),
      }
    );

    expect(
      firestoreTransactionMock.update
    ).toHaveBeenCalledWith(
      'users/user-1/accounts/account-2',
      {
        currentBalance: 10000,
        updatedAt: jasmine.any(String),
      }
    );

    expect(
      firestoreTransactionMock.update
    ).toHaveBeenCalledWith(
      'users/user-1/accounts/account-3',
      {
        currentBalance: 23000,
        updatedAt: jasmine.any(String),
      }
    );

    expect(
      firestoreTransactionMock.update
    ).toHaveBeenCalledWith(
      'users/user-1/accounts/account-4',
      {
        currentBalance: 17000,
        updatedAt: jasmine.any(String),
      }
    );

    expect(
      firestoreTransactionMock.update
    ).toHaveBeenCalledTimes(4);
  });

  it('should delete an expense and reverse its ledger effect', async () => {
    const transaction: Transaction = {
      id: 'expense-delete-1',
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
      notes: null,
      investmentId: null,
      debtId: null,
      createdAt: '2026-09-17T00:00:00.000Z',
      updatedAt: '2026-09-17T00:00:00.000Z',
    };

    firestoreTransactionServiceMock.run.and.callFake(
      async (operation: any) => {
        await operation(firestoreTransactionMock);
      }
    );

    firestoreTransactionMock.get.and.callFake(
      async (ref: string) => {
        if (
          ref ===
          'users/user-1/transactions/expense-delete-1'
        ) {
          return {
            exists: () => true,
            data: () => transaction,
          };
        }

        return {
          exists: () => true,
          data: () => ({
            currentBalance: 50000,
          }),
        };
      }
    );

    await repository.delete(
      'user-1',
      'expense-delete-1'
    );

    expect(
      firestoreTransactionMock.update
    ).toHaveBeenCalledWith(
      'users/user-1/accounts/account-1',
      {
        currentBalance: 52000,
        updatedAt: jasmine.any(String),
      }
    );

    expect(
      firestoreTransactionMock.delete
    ).toHaveBeenCalledWith(
      'users/user-1/transactions/expense-delete-1'
    );
  });

  it('should reject updating a specialized transaction', async () => {
    const transaction: Transaction = {
      id: 'investment-1',
      userId: 'user-1',
      type: 'investment',
      amount: 5000,
      currency: 'INR',
      transactionDate: '2026-09-17',
      description: 'SIP',
      sourceAccountId: 'account-1',
      destinationAccountId: null,
      categoryId: null,
      partyId: null,
      notes: null,
      investmentId: 'investment-1',
      debtId: null,
      createdAt: '2026-09-17T00:00:00.000Z',
      updatedAt: '2026-09-17T00:00:00.000Z',
    };

    await expectAsync(
      repository.update(
        'user-1',
        'investment-1',
        transaction
      )
    ).toBeRejectedWithError(
      /cannot be edited or deleted/
    );

    expect(
      firestoreTransactionServiceMock.run
    ).not.toHaveBeenCalled();
  });

  it('should reject deleting a specialized transaction', async () => {
    firestoreTransactionServiceMock.run.and.callFake(
      async (operation: any) => {
        await operation(firestoreTransactionMock);
      }
    );

    firestoreTransactionMock.get.and.resolveTo({
      exists: () => true,
      data: () => ({
        id: 'payment-1',
        userId: 'user-1',
        type: 'credit-card-payment',
        amount: 5000,
        currency: 'INR',
        transactionDate: '2026-09-17',
        description: 'Card payment',
        sourceAccountId: 'account-1',
        destinationAccountId: 'account-2',
        categoryId: null,
        partyId: null,
        notes: null,
        investmentId: null,
        debtId: null,
        createdAt: '2026-09-17T00:00:00.000Z',
        updatedAt: '2026-09-17T00:00:00.000Z',
      }),
    });

    await expectAsync(
      repository.delete(
        'user-1',
        'payment-1'
      )
    ).toBeRejectedWithError(
      /cannot be edited or deleted/
    );

    expect(
      firestoreTransactionMock.delete
    ).not.toHaveBeenCalled();
  });

  it('should reject updating a transaction belonging to another user', async () => {
    const transaction: Transaction = {
      id: 'expense-user-1',
      userId: 'user-2',
      type: 'expense',
      amount: 1000,
      currency: 'INR',
      transactionDate: '2026-09-17',
      description: 'Expense',
      sourceAccountId: 'account-1',
      destinationAccountId: null,
      categoryId: null,
      partyId: null,
      notes: null,
      investmentId: null,
      debtId: null,
      createdAt: '2026-09-17T00:00:00.000Z',
      updatedAt: '2026-09-17T00:00:00.000Z',
    };

    await expectAsync(
      repository.update(
        'user-1',
        'expense-user-1',
        transaction
      )
    ).toBeRejectedWithError(
      /another user/
    );

    expect(
      firestoreTransactionServiceMock.run
    ).not.toHaveBeenCalled();
  });

  it('should reject updating when the existing transaction does not exist', async () => {
    const transaction: Transaction = {
      id: 'missing-transaction',
      userId: 'user-1',
      type: 'expense',
      amount: 1000,
      currency: 'INR',
      transactionDate: '2026-09-17',
      description: 'Expense',
      sourceAccountId: 'account-1',
      destinationAccountId: null,
      categoryId: null,
      partyId: null,
      notes: null,
      investmentId: null,
      debtId: null,
      createdAt: '2026-09-17T00:00:00.000Z',
      updatedAt: '2026-09-17T00:00:00.000Z',
    };

    firestoreTransactionServiceMock.run.and.callFake(
      async (operation: any) => {
        await operation(firestoreTransactionMock);
      }
    );

    firestoreTransactionMock.get.and.resolveTo({
      exists: () => false,
      data: () => undefined,
    });

    await expectAsync(
      repository.update(
        'user-1',
        'missing-transaction',
        transaction
      )
    ).toBeRejectedWithError(
      /Transaction missing-transaction was not found/
    );

    expect(
      firestoreTransactionMock.set
    ).not.toHaveBeenCalled();

    expect(
      firestoreTransactionMock.update
    ).not.toHaveBeenCalled();
  });
});
