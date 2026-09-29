import { Injectable, inject } from '@angular/core';
import {
  collection,
  collectionData,
  doc,
  orderBy,
  query,
  where,
  Firestore,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

import { CreditCard } from '../../domain/credit-card/credit-card.model';
import { Transaction } from '../../domain/transaction/transaction.model';
import { processTransaction } from '../../domain/transaction/ledger-engine';
import { FirestoreTransactionService } from '../firebase/firestore-transaction.service';
import { Account } from '../../domain/account/account.model';

@Injectable({
  providedIn: 'root',
})
export class CreditCardRepository {
  private readonly firestore = inject(Firestore);

  private readonly firestoreTransaction =
    inject(FirestoreTransactionService);

  getAll(userId: string): Observable<CreditCard[]> {
    const cardsRef = collection(
      this.firestore,
      `users/${userId}/creditCards`
    );

    const cardsQuery = query(
      cardsRef,
      where('userId', '==', userId),
      orderBy('name', 'asc')
    );

    return collectionData(cardsQuery, {
      idField: 'id',
    }) as Observable<CreditCard[]>;
  }

  async create(
    creditCard: CreditCard
  ): Promise<void> {
    const cardRef =
      this.firestoreTransaction.doc(
        `users/${creditCard.userId}/creditCards/${creditCard.id}`
      );

    const accountRef =
      this.firestoreTransaction.doc(
        `users/${creditCard.userId}/accounts/${creditCard.accountId}`
      );

    await this.firestoreTransaction.run(
      async (firestoreTransaction) => {
        const cardSnapshot =
          await firestoreTransaction.get(cardRef);

        if (cardSnapshot.exists()) {
          throw new Error(
            'A credit card with this ID already exists.'
          );
        }

        const accountSnapshot =
          await firestoreTransaction.get(
            accountRef
          );

        if (!accountSnapshot.exists()) {
          throw new Error(
            'Credit card account was not found.'
          );
        }

        const account =
          accountSnapshot.data() as {
            type?: string;
          };

        if (account.type !== 'credit-card') {
          throw new Error(
            'Selected account is not a credit card.'
          );
        }

        firestoreTransaction.set(
          cardRef,
          creditCard
        );
      }
    );
  }

  async createPurchase(
    transaction: Transaction
  ): Promise<void> {
    if (transaction.type !== 'expense') {
      throw new Error(
        'Credit card purchase must be an expense transaction.'
      );
    }

    if (!transaction.sourceAccountId) {
      throw new Error(
        'Credit card purchase requires a credit card account.'
      );
    }

    if (transaction.amount <= 0) {
      throw new Error(
        'Purchase amount must be greater than zero.'
      );
    }

    const result =
      processTransaction(transaction);

    await this.firestoreTransaction.run(
      async (firestoreTransaction) => {
        const transactionRef =
          this.firestoreTransaction.doc(
            `users/${transaction.userId}/transactions/${transaction.id}`
          );

        const accountRef =
          this.firestoreTransaction.doc(
            `users/${transaction.userId}/accounts/${transaction.sourceAccountId}`
          );

        const accountSnapshot =
          await firestoreTransaction.get(
            accountRef
          );

        if (!accountSnapshot.exists()) {
          throw new Error(
            'Credit card account was not found.'
          );
        }

        const account =
          accountSnapshot.data() as {
            type?: string;
            currentBalance?: number;
          };

        if (account.type !== 'credit-card') {
          throw new Error(
            'Source account must be a credit card.'
          );
        }

        if (
          typeof account.currentBalance !==
          'number'
        ) {
          throw new Error(
            'Credit card has an invalid balance.'
          );
        }

        const creditCardRef =
          this.firestoreTransaction.doc(
            `users/${transaction.userId}/creditCards/${transaction.sourceAccountId}`
          );

        const creditCardSnapshot =
          await firestoreTransaction.get(
            creditCardRef
          );

        if (!creditCardSnapshot.exists()) {
          throw new Error(
            'Credit card configuration was not found.'
          );
        }

        const creditCard =
          creditCardSnapshot.data() as CreditCard;

        const newOutstanding =
          account.currentBalance +
          transaction.amount;

        if (
          newOutstanding >
          creditCard.creditLimit
        ) {
          throw new Error(
            'Credit card purchase exceeds the available credit limit.'
          );
        }

        firestoreTransaction.update(
          accountRef,
          {
            currentBalance: newOutstanding,
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

  async recordPayment(
    transaction: Transaction
  ): Promise<void> {
    if (
      transaction.type !==
      'credit-card-payment'
    ) {
      throw new Error(
        'Credit card payment must use the credit-card-payment transaction type.'
      );
    }

    if (
      !transaction.sourceAccountId ||
      !transaction.destinationAccountId
    ) {
      throw new Error(
        'Credit card payment requires both source and destination accounts.'
      );
    }

    if (transaction.amount <= 0) {
      throw new Error(
        'Payment amount must be greater than zero.'
      );
    }

    await this.firestoreTransaction.run(
      async (firestoreTransaction) => {
        const transactionRef =
          this.firestoreTransaction.doc(
            `users/${transaction.userId}/transactions/${transaction.id}`
          );

        const sourceAccountRef =
          this.firestoreTransaction.doc(
            `users/${transaction.userId}/accounts/${transaction.sourceAccountId}`
          );

        const destinationAccountRef =
          this.firestoreTransaction.doc(
            `users/${transaction.userId}/accounts/${transaction.destinationAccountId}`
          );

        const [
          sourceSnapshot,
          destinationSnapshot,
        ] = await Promise.all([
          firestoreTransaction.get(
            sourceAccountRef
          ),
          firestoreTransaction.get(
            destinationAccountRef
          ),
        ]);

        if (!sourceSnapshot.exists()) {
          throw new Error(
            'Payment source account was not found.'
          );
        }

        if (!destinationSnapshot.exists()) {
          throw new Error(
            'Credit card account was not found.'
          );
        }

        const source =
          sourceSnapshot.data() as {
            type?: string;
            currentBalance?: number;
          };

        const destination =
          destinationSnapshot.data() as {
            type?: string;
            currentBalance?: number;
          };

        if (
          source.type !== 'bank' &&
          source.type !== 'cash'
        ) {
          throw new Error(
            'Payment source must be a bank or cash account.'
          );
        }

        if (
          destination.type !== 'credit-card'
        ) {
          throw new Error(
            'Payment destination must be a credit card.'
          );
        }

        if (
          typeof source.currentBalance !==
          'number' ||
          typeof destination.currentBalance !==
          'number'
        ) {
          throw new Error(
            'One of the payment accounts has an invalid balance.'
          );
        }

        if (
          transaction.amount >
          source.currentBalance
        ) {
          throw new Error(
            'Insufficient balance in the payment account.'
          );
        }

        if (
          transaction.amount >
          destination.currentBalance
        ) {
          throw new Error(
            'Payment cannot exceed the credit card outstanding balance.'
          );
        }

        firestoreTransaction.update(
          sourceAccountRef,
          {
            currentBalance:
              source.currentBalance -
              transaction.amount,
            updatedAt: new Date().toISOString(),
          }
        );

        firestoreTransaction.update(
          destinationAccountRef,
          {
            currentBalance:
              destination.currentBalance -
              transaction.amount,
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

  async createWithAccount(
    creditCard: CreditCard,
    account: Account
  ): Promise<void> {
    if (account.type !== 'credit-card') {
      throw new Error(
        'Credit card must use a credit-card account.'
      );
    }

    if (account.id !== creditCard.accountId) {
      throw new Error(
        'Credit card must reference the created account.'
      );
    }

    const accountRef =
      this.firestoreTransaction.doc(
        `users/${account.userId}/accounts/${account.id}`
      );

    const cardRef =
      this.firestoreTransaction.doc(
        `users/${creditCard.userId}/creditCards/${creditCard.id}`
      );

    await this.firestoreTransaction.run(
      async (firestoreTransaction) => {
        const [
          accountSnapshot,
          cardSnapshot,
        ] = await Promise.all([
          firestoreTransaction.get(accountRef),
          firestoreTransaction.get(cardRef),
        ]);

        if (accountSnapshot.exists()) {
          throw new Error(
            'An account with this ID already exists.'
          );
        }

        if (cardSnapshot.exists()) {
          throw new Error(
            'A credit card with this ID already exists.'
          );
        }

        firestoreTransaction.set(
          accountRef,
          account
        );

        firestoreTransaction.set(
          cardRef,
          creditCard
        );
      }
    );
  }
}
