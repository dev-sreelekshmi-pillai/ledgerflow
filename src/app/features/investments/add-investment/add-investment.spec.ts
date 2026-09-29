import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { InvestmentStore } from '../investment.store';
import { AccountStore } from '../../accounts/account.store';
import { AddInvestment } from './add-investment';
const dialogRefMock = {
  close: jasmine.createSpy('close'),
};

const investmentStoreMock = {
  currentUser: signal(null),
  investments: signal([]),
  investmentCount: signal(0),
  totalInvested: signal(0),
  totalCurrentValue: signal(0),
  totalGainLoss: signal(0),
  totalReturnPercentage: signal(0),
  createInvestment: jasmine.createSpy('createInvestment').and.resolveTo(),
  updateInvestment: jasmine.createSpy('updateInvestment').and.resolveTo(),
  deleteInvestment: jasmine.createSpy('deleteInvestment').and.resolveTo(),
};

const accountStoreMock = {
  accounts: signal([]),
};
describe('AddInvestment', () => {
  let component: AddInvestment;
  let fixture: ComponentFixture<AddInvestment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddInvestment], providers: [
        {
          provide: MatDialogRef,
          useValue: dialogRefMock,
        },
        {
          provide: InvestmentStore,
          useValue: investmentStoreMock,
        },
        {
          provide: AccountStore,
          useValue: accountStoreMock,
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddInvestment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
