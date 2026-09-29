import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { TransactionStore } from '../transactions/transaction.store';
import { Transaction } from '../../domain/transaction/transaction.model';

type ReportPeriod = 'this-month' | 'last-month';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    DecimalPipe,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
  ],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Reports {
  readonly transactionStore = inject(TransactionStore);

  readonly selectedPeriod = signal<ReportPeriod>('this-month');

  readonly periodLabel = computed(() =>
    this.selectedPeriod() === 'this-month'
      ? 'This Month'
      : 'Last Month'
  );

  readonly selectedMonth = computed(() => {
    const now = new Date();

    if (this.selectedPeriod() === 'this-month') {
      return this.toMonthString(now);
    }

    return this.toMonthString(
      new Date(now.getFullYear(), now.getMonth() - 1, 1)
    );
  });

  readonly filteredTransactions = computed(() =>
    this.transactionStore
      .transactions()
      .filter(transaction =>
        transaction.transactionDate.startsWith(this.selectedMonth())
      )
  );

  readonly income = computed(() =>
    this.filteredTransactions()
      .filter(transaction => transaction.type === 'income')
      .reduce((total, transaction) => total + transaction.amount, 0)
  );

  readonly expenses = computed(() =>
    this.filteredTransactions()
      .filter(transaction => transaction.type === 'expense')
      .reduce((total, transaction) => total + transaction.amount, 0)
  );

  readonly netCashFlow = computed(
    () => this.income() - this.expenses()
  );

  readonly transactionCount = computed(
    () => this.filteredTransactions().length
  );

  readonly expenseByCategory = computed(() => {
    const totals = new Map<string, number>();

    this.filteredTransactions()
      .filter(transaction => transaction.type === 'expense')
      .forEach(transaction => {
        if (!transaction.categoryId) {
          return;
        }

        const current = totals.get(transaction.categoryId) ?? 0;

        totals.set(
          transaction.categoryId,
          current + transaction.amount
        );
      });

    return Array.from(totals.entries())
      .map(([categoryId, amount]) => ({
        categoryId,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);
  });

  readonly largestExpense = computed(() => {
    const expenses = this.filteredTransactions()
      .filter(transaction => transaction.type === 'expense');

    return expenses.reduce<Transaction | null>(
      (largest, transaction) =>
        !largest || transaction.amount > largest.amount
          ? transaction
          : largest,
      null
    );
  });

  setPeriod(period: ReportPeriod): void {
    this.selectedPeriod.set(period);
  }

  getPercentage(amount: number): number {
    const total = this.expenses();

    if (total <= 0) {
      return 0;
    }

    return (amount / total) * 100;
  }

  private toMonthString(date: Date): string {
    return `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}`;
  }
}
