import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';

import { signal } from '@angular/core';

import { MatDialogRef } from '@angular/material/dialog';

import { AddCategory } from './add-category';

import { CategoryStore } from '../category.store';

describe('AddCategory', () => {
  let component: AddCategory;
  let fixture: ComponentFixture<AddCategory>;

  const dialogRefMock = {
    close: jasmine.createSpy('close'),
  };

  const categoryStoreMock = {
    currentUser: signal(null),
    categories: signal([]),
    categoryCount: signal(0),

    createCategory:
      jasmine.createSpy('createCategory')
        .and.returnValue(
          Promise.resolve()
        ),

    updateCategory:
      jasmine.createSpy('updateCategory')
        .and.returnValue(
          Promise.resolve()
        ),

    deleteCategory:
      jasmine.createSpy('deleteCategory')
        .and.returnValue(
          Promise.resolve()
        ),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AddCategory,
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: dialogRefMock,
        },
        {
          provide: CategoryStore,
          useValue: categoryStoreMock,
        },
      ],
    }).compileComponents();

    fixture =
      TestBed.createComponent(
        AddCategory
      );

    component =
      fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
