import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CategoryStore } from '../categories/category.store';
import { AccountStore } from '../accounts/account.store';
import { TransactionStore } from '../transactions/transaction.store';
import {
  NgApexchartsModule
} from 'ng-apexcharts';
@Component({
  selector: 'app-dashboard',
  standalone: true,
   imports: [
    DecimalPipe,
    MatIconModule,
    NgApexchartsModule,
],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
    readonly expenseChart = computed(() => {
      const data = this.expenseByCategory();

      return {
        series: data.map(item => item.amount),
        chart: {
          type: 'donut' as const,
          height: 320,
        },
        labels: data.map(item => item.categoryName),
        colors: data.map(item => item.color),
        legend: {
          position: 'bottom' as const,
        },
        dataLabels: {
          enabled: true,
        },
        tooltip: {
          y: {
            formatter: (value: number) => `₹${value.toLocaleString('en-IN')}`,
          },
        },
        responsive: [
          {
            breakpoint: 640,
            options: {
              chart: {
                height: 280,
              },
              legend: {
                position: 'bottom' as const,
              },
            },
          },
        ],
      };
    });
    readonly categoryStore = inject(CategoryStore);

  readonly categories = this.categoryStore.categories;
  readonly accountStore = inject(AccountStore);
  readonly transactionStore = inject(TransactionStore);

  readonly recentTransactions = computed(() =>
    this.transactionStore.transactions().slice(0, 5)
  );

  readonly activeAccounts = computed(() =>
    this.accountStore.accounts().filter(account => account.isActive)
  );
  readonly totalAssets = computed(() =>
    this.accountStore.accounts()
      .filter(account => account.isActive && account.type !== 'loan' && account.type !== 'credit-card')
      .reduce((total, account) => total + account.currentBalance, 0)
  );
  getTransactionLabel(type: string): string {
    switch (type) {
      case 'income':
        return 'Income';
      case 'expense':
        return 'Expense';
      case 'transfer':
        return 'Transfer';
      case 'investment':
        return 'Investment';
      case 'debt-given':
        return 'Debt Given';
      case 'debt-received':
        return 'Debt Received';
      case 'loan-repayment':
        return 'Loan Repayment';
      default:
        return type;
    }
  }

  getTransactionClass(type: string): string {
    switch (type) {
      case 'income':
        return 'lf-income';
      case 'expense':
        return 'lf-expense';
      case 'investment':
        return 'lf-investment';
      case 'transfer':
      case 'debt-given':
      case 'debt-received':
      case 'loan-repayment':
        return 'lf-transfer';
      default:
        return '';
    }
  }

  readonly expenseByCategory = computed(() => {
    const transactions = this.transactionStore.transactions();
    const categories = this.categories();

    const totals = new Map<string, number>();

    transactions
      .filter(transaction => transaction.type === 'expense')
      .forEach(transaction => {
        if (!transaction.categoryId) {
          return;
        }

        const current = totals.get(transaction.categoryId) ?? 0;
        totals.set(transaction.categoryId, current + transaction.amount);
      });

    return Array.from(totals.entries())
      .map(([categoryId, amount]) => {
        const category = categories.find(
          category => category.id === categoryId
        );

        return {
          categoryId,
          categoryName: category?.name ?? 'Uncategorized',
          color: category?.color ?? '#94a3b8',
          icon: category?.icon ?? 'category',
          amount,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  });
}
