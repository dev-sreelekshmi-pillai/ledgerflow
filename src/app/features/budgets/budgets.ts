import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Budget } from '../../domain/budget/budget.model';
import { BudgetStore } from './budget.store';
import { CategoryStore } from '../categories/category.store';
import { AddBudget } from './add-budget/add-budget';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [
    DecimalPipe,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './budgets.html',
  styleUrl: './budgets.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Budgets {
  readonly budgetStore = inject(BudgetStore);
  readonly categoryStore = inject(CategoryStore);

  private readonly dialog = inject(MatDialog);

  readonly budgets = this.budgetStore.budgets;
  readonly categories = this.categoryStore.categories;

  openAddBudget(): void {
    this.dialog.open(AddBudget, {
      width: '480px',
      maxWidth: '95vw',
    });
  }

  getCategoryName(categoryId: string): string {
    return (
      this.categories().find(
        category => category.id === categoryId
      )?.name ?? 'Uncategorized'
    );
  }

  getCategoryIcon(categoryId: string): string {
    return (
      this.categories().find(
        category => category.id === categoryId
      )?.icon ?? 'category'
    );
  }

  getCategoryColor(categoryId: string): string {
    return (
      this.categories().find(
        category => category.id === categoryId
      )?.color ?? '#94a3b8'
    );
  }

  getProgressWidth(budget: Budget): number {
    return Math.min(
      this.budgetStore.getUsagePercentage(budget),
      100
    );
  }
  getStatusLabel(budget: Budget): string {
    switch (this.budgetStore.getBudgetStatus(budget)) {
      case 'on-track':
        return 'On track';
      case 'near-limit':
        return 'Near limit';
      case 'over-budget':
        return 'Over budget';
    }
  }
}
