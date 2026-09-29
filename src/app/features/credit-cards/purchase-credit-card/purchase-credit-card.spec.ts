import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseCreditCard } from './purchase-credit-card';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { PartyStore } from '../../../state/party.store';
import { CategoryStore } from '../../categories/category.store';
import { CreditCardStore } from '../../../state/credit-card';
import { AuthService } from '../../../core/auth/auth.service';

const authServiceMock = {
  currentUser: jasmine.createSpy('currentUser').and.returnValue({
    uid: 'test-user-id',
    email: 'test@example.com',
  }),
};

const creditCardStoreMock = {
  getCreditCardById: jasmine
    .createSpy('getCreditCardById')
    .and.returnValue({
      id: 'card-1',
      userId: 'test-user-id',
      accountId: 'card-1',
      name: 'HDFC Millennia',
      creditLimit: 50000,
      billingDay: 5,
      dueDay: 25,
      currency: 'INR',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    }),

  createPurchase: jasmine
    .createSpy('createPurchase')
    .and.returnValue(Promise.resolve()),
};

const categoryStoreMock = {
  categories: jasmine
    .createSpy('categories')
    .and.returnValue([]),
};

const partyStoreMock = {
  activeParties: jasmine
    .createSpy('activeParties')
    .and.returnValue([]),
};

const dialogRefMock = {
  close: jasmine.createSpy('close'),
};

describe('PurchaseCreditCard', () => {
  let component: PurchaseCreditCard;
  let fixture: ComponentFixture<PurchaseCreditCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseCreditCard],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: CreditCardStore,
          useValue: creditCardStoreMock,
        },
        {
          provide: CategoryStore,
          useValue: categoryStoreMock,
        },
        {
          provide: PartyStore,
          useValue: partyStoreMock,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            creditCardId: 'card-1',
          },
        },
        {
          provide: MatDialogRef,
          useValue: dialogRefMock,
        },
      ],
    }).compileComponents();


    fixture = TestBed.createComponent(PurchaseCreditCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
