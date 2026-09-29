import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Reports } from './reports'; import { signal } from '@angular/core';
import { TransactionStore } from '../transactions/transaction.store';
const transactionStoreMock = {
  transactions: signal([]),
  transactionCount: signal(0),
  totalIncome: signal(0),
  totalExpenses: signal(0),
  netCashFlow: signal(0),
};
describe('Reports', () => {
  let component: Reports;
  let fixture: ComponentFixture<Reports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reports], providers: [
        {
          provide: TransactionStore,
          useValue: transactionStoreMock,
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Reports);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
