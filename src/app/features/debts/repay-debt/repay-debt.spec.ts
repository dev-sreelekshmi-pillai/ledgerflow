import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { RepayDebt } from './repay-debt';
import { DebtStore } from '../../../state/debt.store';
import { AccountStore } from '../../accounts/account.store';

describe('RepayDebt', () => {
  let component: RepayDebt;
  let fixture: ComponentFixture<RepayDebt>;

  const debtStoreMock = {
    repayDebt: jasmine.createSpy('repayDebt')
      .and.returnValue(Promise.resolve()),
  };

  const accountStoreMock = {
    accounts: () => [
      {
        id: 'account-1',
        userId: 'user-1',
        name: 'ICICI Bank',
        type: 'bank',
        currency: 'INR',
        openingBalance: 10000,
        currentBalance: 10000,
        isActive: true,
        createdAt: '2026-09-29T00:00:00.000Z',
        updatedAt: '2026-09-29T00:00:00.000Z',
      },
    ],
  };

  const dialogRefMock = {
    close: jasmine.createSpy('close'),
  };

  const debtMock = {
    id: 'debt-1',
    userId: 'user-1',
    partyId: 'party-1',
    direction: 'lent',
    accountId: 'account-1',
    principalAmount: 5000,
    outstandingAmount: 5000,
    startDate: '2026-09-29',
    currency: 'INR',
    status: 'active',
    notes: null,
    createdAt: '2026-09-29T00:00:00.000Z',
    updatedAt: '2026-09-29T00:00:00.000Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepayDebt],
      providers: [
        {
          provide: DebtStore,
          useValue: debtStoreMock,
        },
        {
          provide: AccountStore,
          useValue: accountStoreMock,
        },
        {
          provide: MatDialogRef,
          useValue: dialogRefMock,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: debtMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RepayDebt);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
