import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddTransaction } from '../add-transaction/add-transaction';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TransactionStore } from '../transaction.store';
import { DecimalPipe } from '@angular/common';
import { CategoryStore } from '../../categories/category.store';
@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule, DecimalPipe

  ],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Transactions {
    readonly categoryStore = inject(CategoryStore);
  readonly categories = this.categoryStore.categories;
  readonly transactionStore = inject(
    TransactionStore
  ); private readonly dialog =
    inject(MatDialog);

  openAddTransaction(): void {
    this.dialog.open(
      AddTransaction,
      {
        width: '520px',
        maxWidth: '95vw',
      }
    );
  }

  getCategoryName(categoryId: string | null): string {
    if (!categoryId) {
      return 'Uncategorized';
    }

    const category = this.categories().find(
      category => category.id === categoryId
    );

    return category?.name ?? 'Uncategorized';
  } getCategory(categoryId: string | null) {
    if (!categoryId) {
      return null;
    }

    return this.categories().find(
      category => category.id === categoryId
    ) ?? null;
  }
}
