import {
  Component,
  computed,
  inject,
} from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

import { CreditCardStore } from '../../../state/credit-card';
import { AccountStore } from '../../accounts/account.store';
import { AddCreditCard } from '../add-credit-card/add-credit-card';
import { DecimalPipe } from '@angular/common';
import { PurchaseCreditCard } from '../purchase-credit-card/purchase-credit-card';
import { PayCreditCard } from '../pay-credit-card/pay-credit-card';

@Component({
  selector: 'app-credit-cards',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    DecimalPipe,
  ],
  templateUrl: './credit-cards.html',
  styleUrl: './credit-cards.css',
})
export class CreditCards {
  readonly Math = Math;
  private readonly creditCardStore =
    inject(CreditCardStore);

  private readonly accountStore =
    inject(AccountStore);

  private readonly dialog =
    inject(MatDialog);

  readonly creditCards =
    this.creditCardStore.activeCreditCards;

  readonly cardsWithAccounts = computed(() =>
    this.creditCards().map((card) => {
      const account = this.accountStore
        .accounts()
        .find(
          (item) =>
            item.id === card.accountId
        );

      const outstanding =
        account?.currentBalance ?? 0;

      const available =
        Math.max(
          card.creditLimit - outstanding,
          0
        );

      const utilization =
        card.creditLimit > 0
          ? (outstanding / card.creditLimit) * 100
          : 0;

      return {
        card,
        account,
        outstanding,
        available,
        utilization,
      };
    })
  );

  readonly totalLimit = computed(() =>
    this.cardsWithAccounts().reduce(
      (total, item) =>
        total + item.card.creditLimit,
      0
    )
  );

  readonly totalOutstanding = computed(() =>
    this.cardsWithAccounts().reduce(
      (total, item) =>
        total + item.outstanding,
      0
    )
  );

  readonly totalAvailable = computed(() =>
    Math.max(
      this.totalLimit() -
      this.totalOutstanding(),
      0
    )
  );

  openAddCreditCard(): void {
    this.dialog.open(AddCreditCard, {
      width: '500px',
      maxWidth: '95vw',
    });
  }

  openPurchaseCreditCard(cardId: string): void {
    this.dialog.open(PurchaseCreditCard, {
      width: '500px',
      maxWidth: '95vw',
      data: {
        creditCardId: cardId,
      },
    });
  }

  openPayCreditCard(cardId: string): void {
    this.dialog.open(PayCreditCard, {
      width: '500px',
      maxWidth: '95vw',
      data: {
        creditCardId: cardId,
      },
    });
  }
}
