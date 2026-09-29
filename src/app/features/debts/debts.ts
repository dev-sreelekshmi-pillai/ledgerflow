import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { DebtStore } from '../../state/debt.store';
import { PartyStore } from '../../state/party.store';
import { AddDebt } from './add-debt/add-debt';
import { Debt } from '../../domain/debt/debt.model';
import { RepayDebt } from './repay-debt/repay-debt';

@Component({
  selector: 'app-debts',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
  ],
  templateUrl: './debts.html',
  styleUrl: './debts.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Debts implements OnInit {
  readonly debtStore = inject(DebtStore);
  readonly partyStore = inject(PartyStore);

  private readonly dialog = inject(MatDialog);

  ngOnInit(): void {
    this.debtStore.loadDebts();
    this.partyStore.loadParties();
  }

  openAddDebt(): void {
    this.dialog.open(AddDebt, {
      width: '520px',
      maxWidth: '95vw',
    });
  }

  getPartyName(partyId: string): string {
    return (
      this.partyStore.getPartyById(partyId)?.name ??
      'Unknown party'
    );
  }

  openRepayment(debt: Debt): void {
    this.dialog.open(RepayDebt, {
      width: '520px',
      maxWidth: '95vw',
      data: debt,
    });
  }
}
