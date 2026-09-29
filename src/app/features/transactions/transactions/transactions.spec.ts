import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { signal } from '@angular/core';
import { CategoryStore } from '../../categories/category.store';
import { Transactions } from './transactions';
import { TransactionStore } from '../transaction.store';

describe('Transactions', () => {
  let component: Transactions;
  let fixture: ComponentFixture<Transactions>;

  const transactionStoreMock = {
    transactions: signal([]),
    transactionCount: signal(0),
    totalIncome: signal(0),
    totalExpenses: signal(0),
    netCashFlow: signal(0),
  };
  const categoryStoreMock = {
    currentUser: signal(null),
    categories: signal([]),
    categoryCount: signal(0),
  };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Transactions],
      providers: [
        {
          provide: TransactionStore,
          useValue: transactionStoreMock,
        },
          { provide: TransactionStore, useValue: transactionStoreMock },
          { provide: CategoryStore, useValue: categoryStoreMock },

      ],
    }).compileComponents();

    fixture =
      TestBed.createComponent(Transactions);

    component =
      fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
