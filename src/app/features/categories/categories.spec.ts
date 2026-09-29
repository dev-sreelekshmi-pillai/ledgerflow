import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';

import { signal } from '@angular/core';

import { Categories } from './categories';

import { CategoryStore } from './category.store';

describe('Categories', () => {
  let component: Categories;
  let fixture: ComponentFixture<Categories>;

  const categoryStoreMock = {
    currentUser: signal(null),
    categories: signal([]),
    categoryCount: signal(0),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Categories,
      ],
      providers: [
        {
          provide: CategoryStore,
          useValue: categoryStoreMock,
        },
      ],
    }).compileComponents();

    fixture =
      TestBed.createComponent(
        Categories
      );

    component =
      fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
