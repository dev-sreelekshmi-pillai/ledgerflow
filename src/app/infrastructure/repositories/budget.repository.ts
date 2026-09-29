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
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

import { Budget } from '../../domain/budget/budget.model';

@Injectable({
  providedIn: 'root',
})
export class BudgetRepository {
  private readonly firestore = inject(Firestore);

  getAll(userId: string): Observable<Budget[]> {
    const budgetsRef = collection(
      this.firestore,
      `users/${userId}/budgets`
    );

    const budgetsQuery = query(
      budgetsRef,
      where('userId', '==', userId)
    );

    return collectionData(budgetsQuery, {
      idField: 'id',
    }) as Observable<Budget[]>;
  }

  async create(budget: Budget): Promise<void> {
    const budgetRef = doc(
      this.firestore,
      `users/${budget.userId}/budgets/${budget.id}`
    );

    await setDoc(budgetRef, budget);
  }

  async update(budget: Budget): Promise<void> {
    const budgetRef = doc(
      this.firestore,
      `users/${budget.userId}/budgets/${budget.id}`
    );

    await setDoc(budgetRef, budget);
  }

  async delete(userId: string, budgetId: string): Promise<void> {
    const budgetRef = doc(
      this.firestore,
      `users/${userId}/budgets/${budgetId}`
    );

    await deleteDoc(budgetRef);
  }
}
