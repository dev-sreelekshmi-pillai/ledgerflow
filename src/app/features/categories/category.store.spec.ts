import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';

import { CategoryStore } from './category.store';
import { CategoryRepository } from '../../infrastructure/repositories/category.repository';
import { AuthService } from '../../core/auth/auth.service';
import { Category } from '../../domain/category/category.model';

describe('CategoryStore', () => {
  let store: CategoryStore;

  const currentUserSignal = signal<any>(null);
  const userSubject = new BehaviorSubject<any>(null);

  const authServiceMock = {
    currentUser: currentUserSignal,
    user$: userSubject.asObservable(),
  };

  const categoryRepositoryMock = {
    getAll: jasmine.createSpy('getAll'),
    create: jasmine.createSpy('create'),
    update: jasmine.createSpy('update'),
    delete: jasmine.createSpy('delete'),
  };

  const categories: Category[] = [
    {
      id: 'category-1',
      userId: 'user-1',
      name: 'Food',
      icon: 'restaurant',
      color: '#16a34a',
      isActive: true,
      createdAt: '2026-09-01T09:00:00.000Z',
      updatedAt: '2026-09-01T09:00:00.000Z',
    },
    {
      id: 'category-2',
      userId: 'user-1',
      name: 'Transport',
      icon: 'directions_car',
      color: '#2563eb',
      isActive: true,
      createdAt: '2026-09-01T09:00:00.000Z',
      updatedAt: '2026-09-01T09:00:00.000Z',
    },
  ];

  beforeEach(() => {
    currentUserSignal.set(null);
    userSubject.next(null);

    categoryRepositoryMock.getAll.calls.reset();
    categoryRepositoryMock.create.calls.reset();
    categoryRepositoryMock.update.calls.reset();
    categoryRepositoryMock.delete.calls.reset();

    categoryRepositoryMock.getAll.and.returnValue(
      of([])
    );

    categoryRepositoryMock.create.and.returnValue(
      Promise.resolve()
    );

    categoryRepositoryMock.update.and.returnValue(
      Promise.resolve()
    );

    categoryRepositoryMock.delete.and.returnValue(
      Promise.resolve()
    );

    TestBed.configureTestingModule({
      providers: [
        CategoryStore,
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: CategoryRepository,
          useValue: categoryRepositoryMock,
        },
      ],
    });

    store = TestBed.inject(CategoryStore);
  });

  it('should create', () => {
    expect(store).toBeTruthy();
  });

  it('should have no current user when unauthenticated', () => {
    expect(store.currentUser()).toBeNull();
  });

  it('should return empty categories when unauthenticated', () => {
    expect(store.categories()).toEqual([]);
    expect(store.categoryCount()).toBe(0);
  });

  it('should load categories for the authenticated user', () => {
    categoryRepositoryMock.getAll.and.returnValue(
      of(categories)
    );

    currentUserSignal.set({
      uid: 'user-1',
    });

    userSubject.next({
      uid: 'user-1',
    });

    expect(
      categoryRepositoryMock.getAll
    ).toHaveBeenCalledWith('user-1');

    expect(store.categories()).toEqual(
      categories
    );
  });

  it('should calculate category count', () => {
    categoryRepositoryMock.getAll.and.returnValue(
      of(categories)
    );

    currentUserSignal.set({
      uid: 'user-1',
    });

    userSubject.next({
      uid: 'user-1',
    });

    expect(store.categoryCount()).toBe(2);
  });

  it('should create a category for the authenticated user', async () => {
    currentUserSignal.set({
      uid: 'user-1',
    });

    userSubject.next({
      uid: 'user-1',
    });

    await store.createCategory(
      categories[0]
    );

    expect(
      categoryRepositoryMock.create
    ).toHaveBeenCalledWith(
      categories[0]
    );
  });

  it('should reject category creation when unauthenticated', async () => {
    currentUserSignal.set(null);
    userSubject.next(null);

    await expectAsync(
      store.createCategory(categories[0])
    ).toBeRejectedWithError(
      'User is not authenticated.'
    );

    expect(
      categoryRepositoryMock.create
    ).not.toHaveBeenCalled();
  });

  it('should reject category creation for another user', async () => {
    currentUserSignal.set({
      uid: 'user-1',
    });

    userSubject.next({
      uid: 'user-1',
    });

    const categoryForAnotherUser = {
      ...categories[0],
      userId: 'user-2',
    };

    await expectAsync(
      store.createCategory(
        categoryForAnotherUser
      )
    ).toBeRejectedWithError(
      'Cannot create a category for another user.'
    );

    expect(
      categoryRepositoryMock.create
    ).not.toHaveBeenCalled();
  });

  it('should update a category for the authenticated user', async () => {
    currentUserSignal.set({
      uid: 'user-1',
    });

    userSubject.next({
      uid: 'user-1',
    });

    await store.updateCategory(
      categories[0]
    );

    expect(
      categoryRepositoryMock.update
    ).toHaveBeenCalledWith(
      categories[0]
    );
  });

  it('should reject category update for another user', async () => {
    currentUserSignal.set({
      uid: 'user-1',
    });

    userSubject.next({
      uid: 'user-1',
    });

    const categoryForAnotherUser = {
      ...categories[0],
      userId: 'user-2',
    };

    await expectAsync(
      store.updateCategory(
        categoryForAnotherUser
      )
    ).toBeRejectedWithError(
      'Cannot update a category for another user.'
    );

    expect(
      categoryRepositoryMock.update
    ).not.toHaveBeenCalled();
  });

  it('should delete a category for the authenticated user', async () => {
    currentUserSignal.set({
      uid: 'user-1',
    });

    userSubject.next({
      uid: 'user-1',
    });

    await store.deleteCategory(
      'category-1'
    );

    expect(
      categoryRepositoryMock.delete
    ).toHaveBeenCalledWith(
      'user-1',
      'category-1'
    );
  });

  it('should reject category deletion when unauthenticated', async () => {
    currentUserSignal.set(null);
    userSubject.next(null);

    await expectAsync(
      store.deleteCategory('category-1')
    ).toBeRejectedWithError(
      'User is not authenticated.'
    );

    expect(
      categoryRepositoryMock.delete
    ).not.toHaveBeenCalled();
  });
});
