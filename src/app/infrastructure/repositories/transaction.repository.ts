import { Injectable, inject } from '@angular/core';

import {
  Firestore,
  collection,
  collectionData,
  doc,
  query,
  where,
  orderBy,
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';

import { FirestoreTransactionService } from '../firebase/firestore-transaction.service';

import { Transaction } from '../../domain/transaction/transaction.model';
import { processTransaction } from '../../domain/transaction/ledger-engine';

@Injectable({
  providedIn: 'root',
})
export class TransactionRepository {
  private readonly firestore = inject(Firestore);

  private readonly firestoreTransaction =
    inject(FirestoreTransactionService);

  getAll(
    userId: string
  ): Observable<Transaction[]> {
    const transactionsRef = collection(
      this.firestore,
      `users/${userId}/transactions`
    );

    const transactionsQuery = query(
      transactionsRef,
      where('userId', '==', userId),
      orderBy('transactionDate', 'desc')
    );

    return collectionData(
      transactionsQuery,
      {
        idField: 'id',
      }
    ) as Observable<Transaction[]>;
  }

  async create(
    transaction: Transaction
  ): Promise<void> {
    const result =
      processTransaction(transaction);

    await this.firestoreTransaction.run(
      async (firestoreTransaction) => {
        const transactionRef =
          this.firestoreTransaction.doc(
            `users/${transaction.userId}/transactions/${transaction.id}`
          );

        const accountRefs = result.effects.map(
          (effect) =>
            this.firestoreTransaction.doc(
              `users/${transaction.userId}/accounts/${effect.accountId}`
            )
        );

        const accountSnapshots =
          await Promise.all(
            accountRefs.map((accountRef) =>
              firestoreTransaction.get(
                accountRef
              )
            )
          );

        accountSnapshots.forEach(
          (snapshot, index) => {
            if (!snapshot.exists()) {
              throw new Error(
                `Account ${result.effects[index].accountId} was not found.`
              );
            }
          }
        );

        accountSnapshots.forEach(
          (snapshot, index) => {
            const effect =
              result.effects[index];

            const accountData =
              snapshot.data() as {
                currentBalance?: number;
              };

            const currentBalance =
              accountData.currentBalance;

            if (
              typeof currentBalance !==
              'number'
            ) {
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

                updatedAt:
                  new Date().toISOString(),
              }
            );
          }
        );

        firestoreTransaction.set(
          transactionRef,
          transaction
        );
      }
    );
  }

  async update(
    userId: string,
    transactionId: string,
    updatedTransaction: Transaction
  ): Promise<void> {
    this.assertMutableTransaction(
      updatedTransaction
    );

    if (
      updatedTransaction.userId !== userId
    ) {
      throw new Error(
        'Cannot update a transaction belonging to another user.'
      );
    }

    if (
      updatedTransaction.id !== transactionId
    ) {
      throw new Error(
        'Transaction ID does not match the requested update.'
      );
    }

    const newResult =
      processTransaction(
        updatedTransaction
      );

    await this.firestoreTransaction.run(
      async (firestoreTransaction) => {
        const transactionRef =
          this.firestoreTransaction.doc(
            `users/${userId}/transactions/${transactionId}`
          );

        const existingSnapshot =
          await firestoreTransaction.get(
            transactionRef
          );

        if (!existingSnapshot.exists()) {
          throw new Error(
            `Transaction ${transactionId} was not found.`
          );
        }

        const existingTransaction =
          existingSnapshot.data() as Transaction;

        const oldTransaction: Transaction = {
          ...existingTransaction,
          id: transactionId,
        };

        this.assertMutableTransaction(
          oldTransaction
        );

        const oldResult =
          processTransaction(
            oldTransaction
          );

        const balanceChanges =
          new Map<string, number>();

        for (const effect of oldResult.effects) {
          balanceChanges.set(
            effect.accountId,
            (balanceChanges.get(
              effect.accountId
            ) ?? 0) - effect.balanceChange
          );
        }

        for (const effect of newResult.effects) {
          balanceChanges.set(
            effect.accountId,
            (balanceChanges.get(
              effect.accountId
            ) ?? 0) + effect.balanceChange
          );
        }

        const accountRefs = Array.from(
          balanceChanges.keys()
        ).map((accountId) => ({
          accountId,
          ref: this.firestoreTransaction.doc(
            `users/${userId}/accounts/${accountId}`
          ),
        }));

        const accountSnapshots =
          await Promise.all(
            accountRefs.map(({ ref }) =>
              firestoreTransaction.get(ref)
            )
          );

        accountSnapshots.forEach(
          (snapshot, index) => {
            if (!snapshot.exists()) {
              throw new Error(
                `Account ${accountRefs[index].accountId} was not found.`
              );
            }
          }
        );

        accountSnapshots.forEach(
          (snapshot, index) => {
            const accountId =
              accountRefs[index].accountId;

            const accountData =
              snapshot.data() as {
                currentBalance?: number;
              };

            const currentBalance =
              accountData.currentBalance;

            if (
              typeof currentBalance !==
              'number'
            ) {
              throw new Error(
                `Account ${accountId} has an invalid balance.`
              );
            }

            const balanceChange =
              balanceChanges.get(
                accountId
              ) ?? 0;

            firestoreTransaction.update(
              accountRefs[index].ref,
              {
                currentBalance:
                  currentBalance +
                  balanceChange,

                updatedAt:
                  new Date().toISOString(),
              }
            );
          }
        );

        firestoreTransaction.set(
          transactionRef,
          updatedTransaction
        );
      }
    );
  }

  async delete(
    userId: string,
    transactionId: string
  ): Promise<void> {
    await this.firestoreTransaction.run(
      async (firestoreTransaction) => {
        const transactionRef =
          this.firestoreTransaction.doc(
            `users/${userId}/transactions/${transactionId}`
          );

        const transactionSnapshot =
          await firestoreTransaction.get(
            transactionRef
          );

        if (!transactionSnapshot.exists()) {
          throw new Error(
            `Transaction ${transactionId} was not found.`
          );
        }

        const transaction =
          transactionSnapshot.data() as Transaction;

        const existingTransaction: Transaction = {
          ...transaction,
          id: transactionId,
        };

        this.assertMutableTransaction(
          existingTransaction
        );

        const result =
          processTransaction(
            existingTransaction
          );

        const accountRefs =
          result.effects.map(
            (effect) => ({
              accountId:
                effect.accountId,

              ref:
                this.firestoreTransaction.doc(
                  `users/${userId}/accounts/${effect.accountId}`
                ),
            })
          );

        const accountSnapshots =
          await Promise.all(
            accountRefs.map(({ ref }) =>
              firestoreTransaction.get(ref)
            )
          );

        accountSnapshots.forEach(
          (snapshot, index) => {
            if (!snapshot.exists()) {
              throw new Error(
                `Account ${accountRefs[index].accountId} was not found.`
              );
            }
          }
        );

        accountSnapshots.forEach(
          (snapshot, index) => {
            const accountId =
              accountRefs[index].accountId;

            const accountData =
              snapshot.data() as {
                currentBalance?: number;
              };

            const currentBalance =
              accountData.currentBalance;

            if (
              typeof currentBalance !==
              'number'
            ) {
              throw new Error(
                `Account ${accountId} has an invalid balance.`
              );
            }

            firestoreTransaction.update(
              accountRefs[index].ref,
              {
                currentBalance:
                  currentBalance -
                  result.effects[index]
                    .balanceChange,

                updatedAt:
                  new Date().toISOString(),
              }
            );
          }
        );

        firestoreTransaction.delete(
          transactionRef
        );
      }
    );
  }

  private assertMutableTransaction(
    transaction: Transaction
  ): void {
    const mutableTypes = [
      'income',
      'expense',
      'transfer',
    ];

    if (
      !mutableTypes.includes(
        transaction.type
      )
    ) {
      throw new Error(
        `Transaction type ${transaction.type} cannot be edited or deleted through the generic transaction repository.`
      );
    }
  }
}
