import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';

import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';

import { PayCreditCard } from './pay-credit-card';

import { AuthService } from '../../../core/auth/auth.service';
import { CreditCardStore } from '../../../state/credit-card';
import { AccountStore } from '../../accounts/account.store'

describe('PayCreditCard', () => {
  let component: PayCreditCard;
  let fixture: ComponentFixture<PayCreditCard>;

  const authServiceMock = {
    currentUser: jasmine
      .createSpy('currentUser')
      .and.returnValue({
        uid: 'test-user-id',
        email: 'test@example.com',
      }),
  };

  const creditCardStoreMock = {
    getCreditCardById: jasmine
      .createSpy('getCreditCardById')
      .and.returnValue({
        id: 'card-1',
        userId: 'test-user-id',
        accountId: 'card-1',
        name: 'HDFC Millennia',
        creditLimit: 50000,
        billingDay: 5,
        dueDay: 25,
        currency: 'INR',
        isActive: true,
        createdAt: '',
        updatedAt: '',
      }),

    recordPayment: jasmine
      .createSpy('recordPayment')
      .and.returnValue(
        Promise.resolve()
      ),
  };

  const accountStoreMock = {
    accounts: jasmine
      .createSpy('accounts')
      .and.returnValue([
        {
          id: 'bank-1',
          userId: 'test-user-id',
          name: 'ICICI Bank',
          type: 'bank',
          currency: 'INR',
          openingBalance: 20000,
          currentBalance: 20000,
          isActive: true,
          createdAt: '',
          updatedAt: '',
        },
        {
          id: 'card-1',
          userId: 'test-user-id',
          name: 'HDFC Millennia',
          type: 'credit-card',
          currency: 'INR',
          openingBalance: 0,
          currentBalance: 5000,
          isActive: true,
          createdAt: '',
          updatedAt: '',
        },
      ]),
  };

  const dialogRefMock = {
    close: jasmine.createSpy('close'),
  };

  beforeEach(async () => {
    authServiceMock.currentUser.calls.reset();

    creditCardStoreMock.getCreditCardById.calls.reset();
    creditCardStoreMock.recordPayment.calls.reset();

    accountStoreMock.accounts.calls.reset();

    dialogRefMock.close.calls.reset();

    await TestBed.configureTestingModule({
      imports: [PayCreditCard],

      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: CreditCardStore,
          useValue: creditCardStoreMock,
        },
        {
          provide: AccountStore,
          useValue: accountStoreMock,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            creditCardId: 'card-1',
          },
        },
        {
          provide: MatDialogRef,
          useValue: dialogRefMock,
        },
      ],
    }).compileComponents();

    fixture =
      TestBed.createComponent(
        PayCreditCard
      );

    component =
      fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the selected credit card', () => {
    expect(component.creditCard).toBeTruthy();

    expect(
      component.creditCard?.id
    ).toBe('card-1');
  });

  it('should calculate outstanding amount', () => {
    expect(
      component.outstandingAmount
    ).toBe(5000);

    expect(
      component.availablePaymentAmount
    ).toBe(5000);
  });

  it('should show only bank and cash accounts as payment sources', () => {
    const accounts =
      component.eligibleSourceAccounts;

    expect(accounts.length).toBe(1);
    expect(accounts[0].id).toBe('bank-1');
  });

  it('should not save an invalid form', async () => {
    component.form.setValue({
      sourceAccountId: '',
      amount: 0,
      transactionDate: '',
      description: '',
      notes: '',
    });

    component.form.markAllAsTouched();
    component.form.updateValueAndValidity();

    await component.save();

    expect(
      creditCardStoreMock.recordPayment
    ).not.toHaveBeenCalled();
  });

  it('should reject payment greater than outstanding balance', async () => {
    component.form.setValue({
      sourceAccountId: 'bank-1',
      amount: 6000,
      transactionDate: '2026-09-29',
      description: 'Credit card payment',
      notes: '',
    });

    await component.save();

    expect(
      creditCardStoreMock.recordPayment
    ).not.toHaveBeenCalled();

    expect(
      component.errorMessage
    ).toBe(
      'Payment cannot exceed the outstanding card balance.'
    );
  });

  it('should create a credit card payment', async () => {
    component.form.setValue({
      sourceAccountId: 'bank-1',
      amount: 2000,
      transactionDate: '2026-09-29',
      description: 'HDFC credit card payment',
      notes: 'Monthly payment',
    });

    await component.save();

    expect(
      creditCardStoreMock.recordPayment
    ).toHaveBeenCalled();

    const transaction =
      creditCardStoreMock.recordPayment
        .calls.mostRecent()
        .args[0];

    expect(transaction.type).toBe(
      'credit-card-payment'
    );

    expect(transaction.amount).toBe(2000);

    expect(
      transaction.sourceAccountId
    ).toBe('bank-1');

    expect(
      transaction.destinationAccountId
    ).toBe('card-1');

    expect(
      transaction.categoryId
    ).toBeNull();

    expect(
      transaction.partyId
    ).toBeNull();

    expect(
      transaction.investmentId
    ).toBeNull();

    expect(
      transaction.debtId
    ).toBeNull();

    expect(
      dialogRefMock.close
    ).toHaveBeenCalledWith(true);
  });

  it('should cancel the dialog', () => {
    component.cancel();

    expect(
      dialogRefMock.close
    ).toHaveBeenCalledWith(false);
  });
});
