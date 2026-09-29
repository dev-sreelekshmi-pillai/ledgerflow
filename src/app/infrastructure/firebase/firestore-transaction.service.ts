import { Injectable, inject } from '@angular/core';

import {
  Firestore,
  runTransaction,
  doc,
  DocumentReference,
  Transaction as FirestoreTransaction,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirestoreTransactionService {
  private readonly firestore =
    inject(Firestore);

  run<T>(
    operation: (
      transaction: FirestoreTransaction
    ) => Promise<T>
  ): Promise<T> {
    return runTransaction(
      this.firestore,
      operation
    );
  }

  doc<T = unknown>(
    path: string
  ): DocumentReference<T> {
    return doc(
      this.firestore,
      path
    ) as DocumentReference<T>;
  }
}
