import {
  Injectable,
  computed,
  inject,
} from '@angular/core';

import { toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { AuthService } from '../core/auth/auth.service';
import { CreditCardRepository } from '../infrastructure/repositories/credit-card.repository';

import { CreditCard } from '../domain/credit-card/credit-card.model';
import { Transaction } from '../domain/transaction/transaction.model';
import { Account } from '../domain/account/account.model';

@Injectable({
  providedIn: 'root',
})
export class CreditCardStore {
  private readonly authService =
    inject(AuthService);

  private readonly creditCardRepository =
    inject(CreditCardRepository);

  readonly currentUser = computed(
    () => this.authService.currentUser()
  );

  private readonly creditCardsSignal =
    toSignal(
      this.authService.user$.pipe(
        switchMap((user) =>
          user
            ? this.creditCardRepository.getAll(
              user.uid
            )
            : of([])
        )
      ),
      {
        initialValue: [],
      }
    );

  readonly creditCards = computed(
    () => this.creditCardsSignal()
  );

  readonly activeCreditCards = computed(() =>
    this.creditCards().filter(
      (card) => card.isActive
    )
  );

  readonly creditCardCount = computed(
    () => this.creditCards().length
  );

  getCreditCardById(
    id: string
  ): CreditCard | undefined {
    return this.creditCards().find(
      (card) => card.id === id
    );
  }

  // async createCreditCard(
  //   creditCard: CreditCard
  // ): Promise<void> {
  //   const user =
  //     this.authService.currentUser();

  //   if (!user) {
  //     throw new Error(
  //       'User is not authenticated.'
  //     );
  //   }

  //   if (
  //     creditCard.userId !== user.uid
  //   ) {
  //     throw new Error(
  //       'Cannot create a credit card for another user.'
  //     );
  //   }

  //   if (
  //     creditCard.creditLimit <= 0
  //   ) {
  //     throw new Error(
  //       'Credit limit must be greater than zero.'
  //     );
  //   }

  //   if (
  //     creditCard.billingDay < 1 ||
  //     creditCard.billingDay > 31
  //   ) {
  //     throw new Error(
  //       'Billing day must be between 1 and 31.'
  //     );
  //   }

  //   if (
  //     creditCard.dueDay < 1 ||
  //     creditCard.dueDay > 31
  //   ) {
  //     throw new Error(
  //       'Due day must be between 1 and 31.'
  //     );
  //   }

  //   await this.creditCardRepository.create(
  //     creditCard
  //   );
  // }

  async createPurchase(
    transaction: Transaction
  ): Promise<void> {
    const user =
      this.authService.currentUser();

    if (!user) {
      throw new Error(
        'User is not authenticated.'
      );
    }

    if (
      transaction.userId !== user.uid
    ) {
      throw new Error(
        'Cannot create a transaction for another user.'
      );
    }

    if (transaction.type !== 'expense') {
      throw new Error(
        'Credit card purchase must be an expense.'
      );
    }

    await this.creditCardRepository.createPurchase(
      transaction
    );
  }

  async recordPayment(
    transaction: Transaction
  ): Promise<void> {
    const user =
      this.authService.currentUser();

    if (!user) {
      throw new Error(
        'User is not authenticated.'
      );
    }

    if (
      transaction.userId !== user.uid
    ) {
      throw new Error(
        'Cannot create a transaction for another user.'
      );
    }

    if (
      transaction.type !==
      'credit-card-payment'
    ) {
      throw new Error(
        'Credit card payment must use the credit-card-payment transaction type.'
      );
    }

    await this.creditCardRepository.recordPayment(
      transaction
    );
  }

  async createCreditCardWithAccount(
    creditCard: CreditCard,
    account: Account
  ): Promise<void> {
    const user =
      this.authService.currentUser();

    if (!user) {
      throw new Error(
        'User is not authenticated.'
      );
    }

    if (
      creditCard.userId !== user.uid ||
      account.userId !== user.uid
    ) {
      throw new Error(
        'Cannot create records for another user.'
      );
    }

    if (
      account.type !== 'credit-card'
    ) {
      throw new Error(
        'Account must be a credit card.'
      );
    }

    if (
      account.id !== creditCard.accountId
    ) {
      throw new Error(
        'Credit card must reference the created account.'
      );
    }

    if (
      account.openingBalance !== 0 ||
      account.currentBalance !== 0
    ) {
      throw new Error(
        'A new credit card must start with a zero balance.'
      );
    }

    if (
      creditCard.creditLimit <= 0
    ) {
      throw new Error(
        'Credit limit must be greater than zero.'
      );
    }

    if (
      creditCard.billingDay < 1 ||
      creditCard.billingDay > 31
    ) {
      throw new Error(
        'Billing day must be between 1 and 31.'
      );
    }

    if (
      creditCard.dueDay < 1 ||
      creditCard.dueDay > 31
    ) {
      throw new Error(
        'Due day must be between 1 and 31.'
      );
    }

    await this.creditCardRepository.createWithAccount(
      creditCard,
      account
    );
  }

  // getOutstandingAmount(
  //   accountId: string
  // ): number {
  //   const account =
  //     this.creditCards().find(
  //       (card) =>
  //         card.accountId === accountId
  //     );

  //   if (!account) {
  //     return 0;
  //   }

  //   return 0;
  // }
}
