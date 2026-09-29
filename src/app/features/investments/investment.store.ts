import { computed, inject, Injectable } from '@angular/core';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

import { AuthService } from '../../core/auth/auth.service';
import { InvestmentRepository } from '../../infrastructure/repositories/investment.repository';
import {
  Investment,
  getInvestmentGainLoss,
  getInvestmentReturnPercentage,
} from '../../domain/investment/investment.model';
import { Transaction } from '../../domain/transaction/transaction.model';
@Injectable({
  providedIn: 'root',
})
export class InvestmentStore {
  private readonly authService = inject(AuthService);
  private readonly investmentRepository =
    inject(InvestmentRepository);

  readonly currentUser = computed(() =>
    this.authService.currentUser()
  );

  private readonly investmentsSignal = toSignal(
    this.authService.user$.pipe(
      switchMap(user =>
        user
          ? this.investmentRepository.getAll(user.uid)
          : of([])
      )
    ),
    {
      initialValue: [],
    }
  );

  readonly investments = computed(() =>
    this.investmentsSignal()
  );

  readonly investmentCount = computed(() =>
    this.investments().length
  );

  readonly totalInvested = computed(() =>
    this.investments()
      .filter(investment => investment.isActive)
      .reduce(
        (total, investment) =>
          total + investment.investedAmount,
        0
      )
  );

  readonly totalCurrentValue = computed(() =>
    this.investments()
      .filter(investment => investment.isActive)
      .reduce(
        (total, investment) =>
          total + investment.currentValue,
        0
      )
  );

  readonly totalGainLoss = computed(() =>
    this.totalCurrentValue() - this.totalInvested()
  );

  readonly totalReturnPercentage = computed(() => {
    const invested = this.totalInvested();

    if (invested <= 0) {
      return 0;
    }

    return (
      (this.totalGainLoss() / invested) * 100
    );
  });

  getGainLoss(investment: Investment): number {
    return getInvestmentGainLoss(investment);
  }

  getReturnPercentage(investment: Investment): number {
    return getInvestmentReturnPercentage(investment);
  }

  async createInvestment(
    investment: Investment
  ): Promise<void> {
    const user = this.authService.currentUser();

    if (!user) {
      throw new Error('User is not authenticated.');
    }

    if (investment.userId !== user.uid) {
      throw new Error(
        'Cannot create an investment for another user.'
      );
    }

    const now = new Date().toISOString();

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      userId: user.uid,
      type: 'investment',
      amount: investment.investedAmount,
      currency: investment.currency,
      transactionDate: investment.purchaseDate,
      description: `Investment: ${investment.name}`,
      sourceAccountId: investment.accountId,
      destinationAccountId: null,
      categoryId: null,
      partyId: null,
      investmentId: investment.id, debtId: null,
      notes: investment.notes,
      createdAt: now,
      updatedAt: now,
    };

    await this.investmentRepository.createWithTransaction(
      investment,
      transaction
    );
  }
  async updateInvestment(
    investment: Investment
  ): Promise<void> {
    const user = this.authService.currentUser();

    if (!user) {
      throw new Error('User is not authenticated.');
    }

    if (investment.userId !== user.uid) {
      throw new Error(
        'Cannot update an investment for another user.'
      );
    }

    await this.investmentRepository.update(investment);
  }

  async deleteInvestment(
    investmentId: string
  ): Promise<void> {
    const user = this.authService.currentUser();

    if (!user) {
      throw new Error('User is not authenticated.');
    }

    await this.investmentRepository.delete(
      user.uid,
      investmentId
    );
  }
}
