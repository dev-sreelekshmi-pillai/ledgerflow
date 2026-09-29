import { Injectable, inject } from '@angular/core';

import {
  Firestore,
  collection,
  collectionData,
  deleteDoc,
  doc,
  query,
  setDoc,
  where,
  DocumentReference,
} from '@angular/fire/firestore'; import { Transaction } from '../../domain/transaction/transaction.model';
import { Observable } from 'rxjs';
import { FirestoreTransactionService } from '../firebase/firestore-transaction.service';
import { Investment } from '../../domain/investment/investment.model'; import { processTransaction } from '../../domain/transaction/ledger-engine';
@Injectable({
  providedIn: 'root',
})
export class InvestmentRepository {
  private readonly firestore = inject(Firestore);
  private readonly firestoreTransaction =
    inject(FirestoreTransactionService);
  getAll(userId: string): Observable<Investment[]> {
    const investmentsRef = collection(
      this.firestore,
      `users/${userId}/investments`
    );

    const investmentsQuery = query(
      investmentsRef,
      where('userId', '==', userId)
    );

    return collectionData(investmentsQuery, {
      idField: 'id',
    }) as Observable<Investment[]>;
  }

  async create(investment: Investment): Promise<void> {
    const investmentRef = doc(
      this.firestore,
      `users/${investment.userId}/investments/${investment.id}`
    );

    await setDoc(investmentRef, investment);
  }
  async createWithTransaction(
    investment: Investment,
    transaction: Transaction
  ): Promise<void> {
    const result = processTransaction(transaction);

    await this.firestoreTransaction.run(
      async firestoreTransaction => {
        const investmentRef =
          this.firestoreTransaction.doc(
            `users/${investment.userId}/investments/${investment.id}`
          );

        const transactionRef =
          this.firestoreTransaction.doc(
            `users/${transaction.userId}/transactions/${transaction.id}`
          );

        const accountRefs = result.effects.map(effect =>
          this.firestoreTransaction.doc(
            `users/${investment.userId}/accounts/${effect.accountId}`
          )
        );

        const accountSnapshots =
          await Promise.all(
            accountRefs.map(accountRef =>
              firestoreTransaction.get(accountRef)
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
            const effect = result.effects[index];

            const accountData =
              snapshot.data() as {
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
                updatedAt:
                  new Date().toISOString(),
              }
            );
          }
        );

        firestoreTransaction.set(
          investmentRef,
          investment
        );

        firestoreTransaction.set(
          transactionRef,
          transaction
        );
      }
    );
  }

  async update(investment: Investment): Promise<void> {
    const investmentRef = doc(
      this.firestore,
      `users/${investment.userId}/investments/${investment.id}`
    );

    await setDoc(investmentRef, investment);
  }

  async delete(
    userId: string,
    investmentId: string
  ): Promise<void> {
    const investmentRef = doc(
      this.firestore,
      `users/${userId}/investments/${investmentId}`
    );

    await deleteDoc(investmentRef);
  }
}
