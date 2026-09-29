import {
  Injectable,
  inject,
  Injector,
  runInInjectionContext,
} from '@angular/core';

import {
  Firestore,
  collection,
  collectionData,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';

import { Account } from '../../domain/account/account.model';

@Injectable({
  providedIn: 'root',
})
export class AccountRepository {
  private readonly firestore = inject(Firestore);
  private readonly injector = inject(Injector);

  getAll(userId: string): Observable<Account[]> {
    return runInInjectionContext(this.injector, () => {
      const accountsRef = collection(
        this.firestore,
        `users/${userId}/accounts`
      );

      const accountsQuery = query(
        accountsRef,
        where('userId', '==', userId)
      );

      return collectionData(accountsQuery, {
        idField: 'id',
      }) as Observable<Account[]>;
    });
  }

  async create(account: Account): Promise<void> {
    const accountRef = doc(
      this.firestore,
      `users/${account.userId}/accounts/${account.id}`
    );

    await setDoc(accountRef, account);
  }

  async update(account: Account): Promise<void> {
    const accountRef = doc(
      this.firestore,
      `users/${account.userId}/accounts/${account.id}`
    );

    await setDoc(accountRef, account);
  }

  async delete(
    userId: string,
    accountId: string
  ): Promise<void> {
    const accountRef = doc(
      this.firestore,
      `users/${userId}/accounts/${accountId}`
    );

    await deleteDoc(accountRef);
  }
}
