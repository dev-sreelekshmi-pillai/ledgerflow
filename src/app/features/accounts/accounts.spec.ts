import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';

import { provideRouter } from '@angular/router';

import { MatDialogModule } from '@angular/material/dialog';

import { Accounts } from './accounts';
import { AccountStore } from './account.store';

describe('Accounts', () => {
  let component: Accounts;
  let fixture: ComponentFixture<Accounts>;

  const accountStoreMock = {
    accounts: () => [],
    accountCount: () => 0,

    totalAssetBalance: () => 0,

    totalLiabilityBalance: () => 0,

    netWorth: () => 0,

    createAccount: jasmine
      .createSpy('createAccount')
      .and.resolveTo(),

    updateAccount: jasmine
      .createSpy('updateAccount')
      .and.resolveTo(),

    deleteAccount: jasmine
      .createSpy('deleteAccount')
      .and.resolveTo(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Accounts,
        MatDialogModule,
      ],

      providers: [
        provideRouter([]),

        {
          provide: AccountStore,
          useValue: accountStoreMock,
        },
      ],
    }).compileComponents();

    fixture =
      TestBed.createComponent(Accounts);

    component =
      fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
