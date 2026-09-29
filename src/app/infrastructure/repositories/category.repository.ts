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

import { Category } from '../../domain/category/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryRepository {
  private readonly firestore =
    inject(Firestore);

  getAll(userId: string): Observable<Category[]> {
    const categoriesRef = collection(
      this.firestore,
      `users/${userId}/categories`
    );

    const categoriesQuery = query(
      categoriesRef,
      where('userId', '==', userId)
    );

    return collectionData(
      categoriesQuery,
      { idField: 'id' }
    ) as Observable<Category[]>;
  }

  async create(category: Category): Promise<void> {
    const categoryRef = doc(
      this.firestore,
      `users/${category.userId}/categories/${category.id}`
    );

    await setDoc(
      categoryRef,
      category
    );
  }

  async update(category: Category): Promise<void> {
    const categoryRef = doc(
      this.firestore,
      `users/${category.userId}/categories/${category.id}`
    );

    await setDoc(
      categoryRef,
      category
    );
  }

  async delete(
    userId: string,
    categoryId: string
  ): Promise<void> {
    const categoryRef = doc(
      this.firestore,
      `users/${userId}/categories/${categoryId}`
    );

    await deleteDoc(categoryRef);
  }
}
