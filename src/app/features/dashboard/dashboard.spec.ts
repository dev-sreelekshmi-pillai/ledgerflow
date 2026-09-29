import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { AccountStore } from '../accounts/account.store';
import { TransactionStore } from '../transactions/transaction.store';
import { Dashboard } from './dashboard'; import { CategoryStore } from '../categories/category.store';
const accountStoreMock = {
  accounts: signal([]),
  totalAssets: signal(0),
};

const transactionStoreMock = {
  transactions: signal([]),
  totalIncome: signal(0),
  totalExpenses: signal(0),
  netCashFlow: signal(0),
}; const categoryStoreMock = {
  currentUser: signal(null),
  categories: signal([]),
  categoryCount: signal(0),
};
describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        { provide: AccountStore, useValue: accountStoreMock },
        { provide: TransactionStore, useValue: transactionStoreMock }, { provide: CategoryStore, useValue: categoryStoreMock }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
