import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';

import { AccountForm } from './account-form';
import { AccountStore } from '../account.store';

describe('AccountForm', () => {
  let component: AccountForm;
  let fixture: ComponentFixture<AccountForm>;

  let accountStoreMock: {
    currentUser: () => {
      uid: string;
      email: string;
    };
    accounts: () => never[];
    accountCount: () => number;
    totalAssetBalance: () => number;
    createAccount: jasmine.Spy;
    updateAccount: jasmine.Spy;
    deleteAccount: jasmine.Spy;
  };

  let dialogRefMock: {
    close: jasmine.Spy;
  };

  beforeEach(async () => {
    accountStoreMock = {
      currentUser: () => ({
        uid: 'test-user',
        email: 'test@example.com',
      }),

      accounts: () => [],
      accountCount: () => 0,
      totalAssetBalance: () => 0,

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

    dialogRefMock = {
      close: jasmine.createSpy('close'),
    };

    await TestBed.configureTestingModule({
      imports: [AccountForm],

      providers: [
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
          useValue: null,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountForm);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not create an account when the form is invalid', async () => {
    await component.save();

    expect(
      accountStoreMock.createAccount
    ).not.toHaveBeenCalled();

    expect(component.accountForm.touched).toBeTrue();
  });

  it('should create an account with the form values', async () => {
    component.accountForm.setValue({
      name: 'ICICI Savings',
      type: 'bank',
      currency: 'INR',
      openingBalance: 50000,
    });

    await component.save();

    expect(
      accountStoreMock.createAccount
    ).toHaveBeenCalledTimes(1);

    const createdAccount =
      accountStoreMock.createAccount.calls
        .mostRecent()
        .args[0];

    expect(createdAccount.userId).toBe('test-user');
    expect(createdAccount.name).toBe('ICICI Savings');
    expect(createdAccount.type).toBe('bank');
    expect(createdAccount.currency).toBe('INR');
    expect(createdAccount.openingBalance).toBe(50000);
    expect(createdAccount.currentBalance).toBe(50000);
    expect(createdAccount.isActive).toBeTrue();
  });

  it('should close the dialog after successful account creation', async () => {
    component.accountForm.setValue({
      name: 'ICICI Savings',
      type: 'bank',
      currency: 'INR',
      openingBalance: 50000,
    });

    await component.save();

    expect(
      dialogRefMock.close
    ).toHaveBeenCalledTimes(1);
  });
});

