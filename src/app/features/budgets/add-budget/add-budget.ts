import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { BudgetStore } from '../budget.store';
import { CategoryStore } from '../../categories/category.store';

@Component({
  selector: 'app-add-budget',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './add-budget.html',
  styleUrl: './add-budget.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddBudget {
  private readonly fb = inject(FormBuilder);

  private readonly dialogRef =
    inject(MatDialogRef<AddBudget>);

  private readonly budgetStore = inject(BudgetStore);
  private readonly categoryStore = inject(CategoryStore);

  readonly categories = this.categoryStore.categories;

  readonly form = this.fb.nonNullable.group({
    categoryId: this.fb.nonNullable.control('', Validators.required),

    amount: this.fb.nonNullable.control(0, [
      Validators.required,
      Validators.min(0.01),
    ]),

    month: this.fb.nonNullable.control(
      this.getCurrentMonth(),
      Validators.required
    ),
  });

  private getCurrentMonth(): string {
    const now = new Date();

    return `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, '0')}`;
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const user = this.budgetStore.currentUser();

    if (!user) {
      return;
    }

    const value = this.form.getRawValue();

    const duplicate = this.budgetStore
      .budgets()
      .some(
        budget =>
          budget.categoryId === value.categoryId &&
          budget.month === value.month &&
          budget.isActive
      );

    if (duplicate) {
      this.form.controls.categoryId.setErrors({
        duplicateBudget: true,
      });

      return;
    }

    const now = new Date().toISOString();

    const budget = {
      id: crypto.randomUUID(),
      userId: user.uid,
      categoryId: value.categoryId,
      amount: value.amount,
      month: value.month,
      currency: 'INR',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await this.budgetStore.createBudget(budget);
      this.dialogRef.close(true);
    } catch (error) {
      console.error('Failed to create budget:', error);
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
