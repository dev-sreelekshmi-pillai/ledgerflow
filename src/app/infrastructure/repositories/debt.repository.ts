import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  deleteDoc,
  doc,
  orderBy,
  query,
  where,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

import {
  Debt,
  DebtStatus,
} from '../../domain/debt/debt.model';
import { Transaction } from '../../domain/transaction/transaction.model';
import { processTransaction } from '../../domain/transaction/ledger-engine';
import { FirestoreTransactionService } from '../firebase/firestore-transaction.service';

@Injectable({
  providedIn: 'root',
})
export class DebtRepository {
  private readonly firestore = inject(Firestore);

  private readonly firestoreTransaction = inject(
    FirestoreTransactionService
  );

  getAll(userId: string): Observable<Debt[]> {
    const debtsRef = collection(
      this.firestore,
      `users/${userId}/debts`
    );

    const debtsQuery = query(
      debtsRef,
      where('userId', '==', userId),
      orderBy('startDate', 'desc')
    );

    return collectionData(debtsQuery, {
      idField: 'id',
    }) as Observable<Debt[]>;
  }

  async createWithTransaction(
    debt: Debt,
    transaction: Transaction
  ): Promise<void> {
    if (
      transaction.type !== 'debt-given' &&
      transaction.type !== 'debt-received'
    ) {
      throw new Error(
        'Debt creation requires a debt-given or debt-received transaction.'
      );
    }

    if (transaction.debtId !== debt.id) {
      throw new Error(
        'Transaction debt does not match the debt being created.'
      );
    }

    if (debt.outstandingAmount !== debt.principalAmount) {
      throw new Error(
        'A newly created debt must have outstanding amount equal to principal amount.'
      );
    }

    const result = processTransaction(transaction);

    await this.firestoreTransaction.run(
      async (firestoreTransaction) => {
        const debtRef = this.firestoreTransaction.doc(
          `users/${debt.userId}/debts/${debt.id}`
        );

        const transactionRef = this.firestoreTransaction.doc(
          `users/${transaction.userId}/transactions/${transaction.id}`
        );

        const debtSnapshot =
          await firestoreTransaction.get(debtRef);

        if (debtSnapshot.exists()) {
          throw new Error(
            `Debt ${debt.id} already exists.`
          );
        }

        const accountRefs = result.effects.map((effect) =>
          this.firestoreTransaction.doc(
            `users/${debt.userId}/accounts/${effect.accountId}`
          )
        );

        const accountSnapshots = await Promise.all(
          accountRefs.map((accountRef) =>
            firestoreTransaction.get(accountRef)
          )
        );

        accountSnapshots.forEach((snapshot, index) => {
          if (!snapshot.exists()) {
            throw new Error(
              `Account ${result.effects[index].accountId} was not found.`
            );
          }
        });

        accountSnapshots.forEach((snapshot, index) => {
          const effect = result.effects[index];

          const accountData = snapshot.data() as {
            currentBalance?: number;
          };

          const currentBalance =
            accountData.currentBalance;

          if (typeof currentBalance !== 'number') {
            throw new Error(
              `Account ${effect.accountId} has an invalid balance.`
            );
          }

          firestoreTransaction.update(
            accountRefs[index],
            {
              currentBalance:
                currentBalance +
                effect.balanceChange,
              updatedAt: new Date().toISOString(),
            }
          );
        });

        firestoreTransaction.set(debtRef, debt);
        firestoreTransaction.set(
          transactionRef,
          transaction
        );
      }
    );
  }

  async recordRepayment(
    debt: Debt,
    transaction: Transaction
  ): Promise<void> {
    if (transaction.type !== 'debt-repayment') {
      throw new Error(
        'Debt repayment requires a debt-repayment transaction.'
      );
    }

    if (transaction.debtId !== debt.id) {
      throw new Error(
        'Transaction debt does not match the debt being repaid.'
      );
    }

    if (transaction.amount <= 0) {
      throw new Error(
        'Repayment amount must be greater than zero.'
      );
    }

    await this.firestoreTransaction.run(
      async (firestoreTransaction) => {
        const debtRef = this.firestoreTransaction.doc(
          `users/${debt.userId}/debts/${debt.id}`
        );

        const transactionRef = this.firestoreTransaction.doc(
          `users/${transaction.userId}/transactions/${transaction.id}`
        );

        const debtSnapshot =
          await firestoreTransaction.get(debtRef);

        if (!debtSnapshot.exists()) {
          throw new Error(
            `Debt ${debt.id} was not found.`
          );
        }

        const currentDebt =
          debtSnapshot.data() as Debt;

        if (
          currentDebt.userId !== debt.userId
        ) {
          throw new Error(
            'Debt does not belong to the current user.'
          );
        }

        if (
          currentDebt.status !== 'active'
        ) {
          throw new Error(
            'Only active debts can be repaid.'
          );
        }

        if (
          transaction.amount >
          currentDebt.outstandingAmount
        ) {
          throw new Error(
            'Repayment amount cannot exceed the outstanding debt.'
          );
        }

        const isLentDebt =
          currentDebt.direction === 'lent';

        const accountId = isLentDebt
          ? transaction.destinationAccountId
          : transaction.sourceAccountId;

        if (!accountId) {
          throw new Error(
            isLentDebt
              ? 'Destination account is required for repayment of money lent.'
              : 'Source account is required for repayment of money borrowed.'
          );
        }

        const accountRef =
          this.firestoreTransaction.doc(
            `users/${debt.userId}/accounts/${accountId}`
          );

        const accountSnapshot =
          await firestoreTransaction.get(accountRef);

        if (!accountSnapshot.exists()) {
          throw new Error(
            `Account ${accountId} was not found.`
          );
        }

        const accountData =
          accountSnapshot.data() as {
            currentBalance?: number;
          };

        const currentBalance =
          accountData.currentBalance;

        if (typeof currentBalance !== 'number') {
          throw new Error(
            `Account ${accountId} has an invalid balance.`
          );
        }

        const balanceChange = isLentDebt
          ? transaction.amount
          : -transaction.amount;

        const newOutstandingAmount =
          currentDebt.outstandingAmount -
          transaction.amount;

        const newStatus: DebtStatus =
          newOutstandingAmount === 0
            ? 'settled'
            : 'active';

        firestoreTransaction.update(
          accountRef,
          {
            currentBalance:
              currentBalance + balanceChange,
            updatedAt: new Date().toISOString(),
          }
        );

        firestoreTransaction.update(
          debtRef,
          {
            outstandingAmount:
              newOutstandingAmount,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          }
        );

        firestoreTransaction.set(
          transactionRef,
          transaction
        );
      }
    );
  }

  async update(debt: Debt): Promise<void> {
    const debtRef = doc(
      this.firestore,
      `users/${debt.userId}/debts/${debt.id}`
    );

    throw new Error(
      'Direct debt updates are not supported. Use debt-specific operations.'
    );
  }

  async delete(
    userId: string,
    debtId: string
  ): Promise<void> {
    const debtRef = doc(
      this.firestore,
      `users/${userId}/debts/${debtId}`
    );

    throw new Error(
      'Deleting debts is not supported yet.'
    );
  }
}
