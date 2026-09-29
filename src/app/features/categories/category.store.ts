import {
  Injectable,
  computed,
  inject,
} from '@angular/core';

import { toSignal } from '@angular/core/rxjs-interop';

import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { AuthService } from '../../core/auth/auth.service';

import { CategoryRepository } from '../../infrastructure/repositories/category.repository';

import { Category } from '../../domain/category/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryStore {
  private readonly authService =
    inject(AuthService);

  private readonly categoryRepository =
    inject(CategoryRepository);

  readonly currentUser = computed(
    () => this.authService.currentUser()
  );

  private readonly categoriesSignal =
    toSignal(
      this.authService.user$.pipe(
        switchMap((user) =>
          user
            ? this.categoryRepository.getAll(
              user.uid
            )
            : of([])
        )
      ),
      {
        initialValue: [],
      }
    );

  readonly categories = computed(
    () => this.categoriesSignal()
  );

  readonly categoryCount = computed(
    () => this.categories().length
  );

  async createCategory(
    category: Category
  ): Promise<void> {
    const user =
      this.authService.currentUser();

    if (!user) {
      throw new Error(
        'User is not authenticated.'
      );
    }

    if (category.userId !== user.uid) {
      throw new Error(
        'Cannot create a category for another user.'
      );
    }

    await this.categoryRepository.create(
      category
    );
  }

  async updateCategory(
    category: Category
  ): Promise<void> {
    const user =
      this.authService.currentUser();

    if (!user) {
      throw new Error(
        'User is not authenticated.'
      );
    }

    if (category.userId !== user.uid) {
      throw new Error(
        'Cannot update a category for another user.'
      );
    }

    await this.categoryRepository.update(
      category
    );
  }

  async deleteCategory(
    categoryId: string
  ): Promise<void> {
    const user =
      this.authService.currentUser();

    if (!user) {
      throw new Error(
        'User is not authenticated.'
      );
    }

    await this.categoryRepository.delete(
      user.uid,
      categoryId
    );
  }
}
