import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Budgets } from './budgets';
import { signal } from '@angular/core';
import { BudgetStore } from './budget.store';
import { CategoryStore } from '../categories/category.store';
const budgetStoreMock = {
  budgets: signal([]),
  budgetCount: signal(0),
  currentUser: signal(null),
  getSpentAmount: () => 0,
  getRemainingAmount: () => 0,
  getUsagePercentage: () => 0,
  getBudgetStatus: () => 'on-track',
};

const categoryStoreMock = {
  categories: signal([]),
  categoryCount: signal(0),
  currentUser: signal(null),
};

describe('Budgets', () => {
  let component: Budgets;
  let fixture: ComponentFixture<Budgets>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Budgets],providers: [
        { provide: BudgetStore, useValue: budgetStoreMock },
        { provide: CategoryStore, useValue: categoryStoreMock },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Budgets);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
