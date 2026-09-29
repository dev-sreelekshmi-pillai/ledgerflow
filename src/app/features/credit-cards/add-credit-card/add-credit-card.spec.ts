import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';

import { MatDialogRef } from '@angular/material/dialog';

import { AddCreditCard } from './add-credit-card';
import { AuthService } from '../../../core/auth/auth.service';
import { CreditCardStore } from '../../../state/credit-card';

describe('AddCreditCard', () => {
  let component: AddCreditCard;
  let fixture: ComponentFixture<AddCreditCard>;

  const authServiceMock = {
    currentUser: jasmine.createSpy('currentUser').and.returnValue({
      uid: 'test-user-id',
      email: 'test@example.com',
    }),
  };

  const creditCardStoreMock = {
    createCreditCardWithAccount:
      jasmine
        .createSpy('createCreditCardWithAccount')
        .and.returnValue(Promise.resolve()),
  };

  const dialogRefMock = {
    close: jasmine.createSpy('close'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCreditCard],
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
          provide: MatDialogRef,
          useValue: dialogRefMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddCreditCard);
    component = fixture.componentInstance;

    creditCardStoreMock.createCreditCardWithAccount.calls.reset();
    dialogRefMock.close.calls.reset();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create a credit card', async () => {
    component.form.setValue({
      name: 'HDFC Millennia',
      creditLimit: 50000,
      billingDay: 5,
      dueDay: 25,
    });

    await component.save();

    expect(
      creditCardStoreMock.createCreditCardWithAccount
    ).toHaveBeenCalled();

    const [creditCard, account] =
      creditCardStoreMock
        .createCreditCardWithAccount
        .calls
        .mostRecent()
        .args;

    expect(creditCard.name).toBe('HDFC Millennia');
    expect(creditCard.creditLimit).toBe(50000);
    expect(creditCard.billingDay).toBe(5);
    expect(creditCard.dueDay).toBe(25);

    expect(creditCard.userId).toBe('test-user-id');

    expect(account.type).toBe('credit-card');
    expect(account.userId).toBe('test-user-id');
    expect(account.currentBalance).toBe(0);
    expect(account.openingBalance).toBe(0);

    expect(account.id).toBe(creditCard.id);
    expect(creditCard.accountId).toBe(account.id);

    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
  });

  it('should not create when the form is invalid', async () => {
    component.form.setValue({
      name: '',
      creditLimit: 0,
      billingDay: 0,
      dueDay: 0,
    });

    component.form.markAllAsTouched();
    component.form.updateValueAndValidity();

    expect(component.form.invalid).toBeTrue();

    await component.save();

    expect(
      creditCardStoreMock.createCreditCardWithAccount
    ).not.toHaveBeenCalled();

    expect(dialogRefMock.close).not.toHaveBeenCalled();
  });
});
