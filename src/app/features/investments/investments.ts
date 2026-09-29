import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { InvestmentStore } from './investment.store';
import { AddInvestment } from './add-investment/add-investment';

@Component({
  selector: 'app-investments',
  standalone: true,
  imports: [
    DecimalPipe,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './investments.html',
  styleUrl: './investments.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Investments {
  readonly investmentStore = inject(InvestmentStore);

  private readonly dialog = inject(MatDialog);

  readonly investments = this.investmentStore.investments;

  openAddInvestment(): void {
    this.dialog.open(AddInvestment, {
      width: '520px',
      maxWidth: '95vw',
    });
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'mutual-fund':
        return 'Mutual Fund';
      case 'stock':
        return 'Stock';
      case 'etf':
        return 'ETF';
      case 'gold':
        return 'Gold';
      case 'fixed-deposit':
        return 'Fixed Deposit';
      default:
        return 'Other';
    }
  }
}
