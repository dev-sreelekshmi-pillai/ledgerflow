import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { CategoryStore } from '../../categories/category.store';
import { AddTransaction } from './add-transaction';

import { MatDialogRef } from '@angular/material/dialog';

import { AccountStore } from '../../accounts/account.store';
import { TransactionStore } from '../transaction.store';

import { signal } from '@angular/core';

describe('AddTransaction', () => {
  let component: AddTransaction;
  let fixture: ComponentFixture<AddTransaction>;

  const dialogRefMock = {
    close: jasmine.createSpy('close'),
  };
  const categoryStoreMock = {
    currentUser: signal(null),
    categories: signal([]),
    categoryCount: signal(0),
  };
  const accountStoreMock = {
    accounts: signal([]),
    accountCount: signal(0),
    totalAssetBalance: signal(0),
    totalLiabilityBalance: signal(0),
    netWorth: signal(0),
  };

  const transactionStoreMock = {
    currentUser: signal(null),
    transactions: signal([]),
    transactionCount: signal(0),
    totalIncome: signal(0),
    totalExpenses: signal(0),
    netCashFlow: signal(0),

    createTransaction:
      jasmine.createSpy('createTransaction')
        .and.returnValue(
          Promise.resolve()
        ),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTransaction],
      providers: [
        {
          provide: MatDialogRef,
          useValue: dialogRefMock,
        },
        {
          provide: AccountStore,
          useValue: accountStoreMock,
        },
        {
          provide: TransactionStore,
          useValue: transactionStoreMock,
        }, {
          provide: CategoryStore,
          useValue: categoryStoreMock,
        },
      ],
    }).compileComponents();

    fixture =
      TestBed.createComponent(AddTransaction);

    component =
      fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
