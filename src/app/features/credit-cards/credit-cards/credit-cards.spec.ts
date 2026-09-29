import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';

import { MatDialog } from '@angular/material/dialog';

import { CreditCards } from './credit-cards';

import { CreditCardStore } from '../../../state/credit-card';
import { AccountStore } from '../../accounts/account.store';

describe('CreditCards', () => {
  let component: CreditCards;
  let fixture: ComponentFixture<CreditCards>;

  const creditCardStoreMock = {
    activeCreditCards: jasmine.createSpy('activeCreditCards'),
  };

  const accountStoreMock = {
    accounts: jasmine.createSpy('accounts'),
  };

  const dialogMock = {
    open: jasmine.createSpy('open').and.returnValue({
      afterClosed: () => ({
        subscribe: jasmine.createSpy('subscribe'),
      }),
    }),
  };

  beforeEach(async () => {
    creditCardStoreMock.activeCreditCards.and.returnValue([]);

    accountStoreMock.accounts.and.returnValue([]);

    await TestBed.configureTestingModule({
      imports: [CreditCards],
      providers: [
        {
          provide: CreditCardStore,
          useValue: creditCardStoreMock,
        },
        {
          provide: AccountStore,
          useValue: accountStoreMock,
        },
        {
          provide: MatDialog,
          useValue: dialogMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreditCards);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show no cards when there are no active credit cards', () => {
    expect(component.cardsWithAccounts()).toEqual([]);
    expect(component.totalLimit()).toBe(0);
    expect(component.totalOutstanding()).toBe(0);
    expect(component.totalAvailable()).toBe(0);
  });

  it('should calculate credit card balances', () => {
    const card = {
      id: 'card-1',
      userId: 'user-1',
      accountId: 'account-1',
      name: 'HDFC Millennia',
      creditLimit: 50000,
      billingDay: 5,
      dueDay: 25,
      currency: 'INR',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    };

    const account = {
      id: 'account-1',
      userId: 'user-1',
      name: 'HDFC Millennia',
      type: 'credit-card',
      currency: 'INR',
      openingBalance: 0,
      currentBalance: 5000,
      isActive: true,
      createdAt: '',
      updatedAt: '',
    };

    creditCardStoreMock.activeCreditCards.and.returnValue([
      card,
    ]);

    accountStoreMock.accounts.and.returnValue([
      account,
    ]);

    fixture = TestBed.createComponent(CreditCards);
    component = fixture.componentInstance;

    fixture.detectChanges();

    const result =
      component.cardsWithAccounts()[0];

    expect(result.outstanding).toBe(5000);
    expect(result.available).toBe(45000);
    expect(result.utilization).toBe(10);

    expect(component.totalLimit()).toBe(50000);
    expect(component.totalOutstanding()).toBe(5000);
    expect(component.totalAvailable()).toBe(45000);
  });

  it('should open the add credit card dialog', () => {
    component.openAddCreditCard();

    expect(dialogMock.open).toHaveBeenCalled();
  });
});
