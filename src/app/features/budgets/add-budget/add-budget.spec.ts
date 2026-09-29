import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBudget } from './add-budget';
import { signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { BudgetStore } from '../budget.store';
import { CategoryStore } from '../../categories/category.store';

const dialogRefMock = {
  close: jasmine.createSpy('close'),
};

const budgetStoreMock = {
  budgets: signal([]),
  budgetCount: signal(0),
  currentUser: signal(null),
  createBudget: jasmine.createSpy('createBudget').and.resolveTo(),
  updateBudget: jasmine.createSpy('updateBudget').and.resolveTo(),
  deleteBudget: jasmine.createSpy('deleteBudget').and.resolveTo(),
};

const categoryStoreMock = {
  categories: signal([]),
  categoryCount: signal(0),
  currentUser: signal(null),
};
describe('AddBudget', () => {
  let component: AddBudget;
  let fixture: ComponentFixture<AddBudget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBudget], providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: BudgetStore, useValue: budgetStoreMock },
        { provide: CategoryStore, useValue: categoryStoreMock },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBudget);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
