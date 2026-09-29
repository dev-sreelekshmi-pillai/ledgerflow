import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDebt } from './add-debt';
import { AuthService } from '../../../core/auth/auth.service';
import { DebtStore } from '../../../state/debt.store';
import { signal } from '@angular/core';
import { PartyStore } from '../../../state/party.store';
import { AccountStore } from '../../accounts/account.store';
import { MatDialogRef } from '@angular/material/dialog';

describe('AddDebt', () => {
  let component: AddDebt;
  let fixture: ComponentFixture<AddDebt>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDebt], providers: [
        {
          provide: AuthService,
          useValue: {
            currentUser: () => ({
              uid: 'test-user',
            }),
          },
        },

        {
          provide: DebtStore,
          useValue: {
            debts: signal([]),
            activeDebts: signal([]),
            settledDebts: signal([]),
            totalLent: signal(0),
            totalBorrowed: signal(0),
            netDebtPosition: signal(0),
            activeDebtCount: signal(0),
            loadDebts: jasmine.createSpy('loadDebts'),
            createDebt: jasmine
              .createSpy('createDebt')
              .and.resolveTo(),
            repayDebt: jasmine.createSpy('repayDebt'),
            getDebtById: jasmine.createSpy('getDebtById'),
            getDebtsByDirection:
              jasmine.createSpy('getDebtsByDirection'),
            getOutstandingAmount:
              jasmine.createSpy('getOutstandingAmount'),
          },
        },

        {
          provide: PartyStore,
          useValue: {
            parties: signal([]),
            activeParties: signal([]),
            partyCount: signal(0),
            loadParties: jasmine.createSpy('loadParties'),
            getPartyById:
              jasmine.createSpy('getPartyById'),
          },
        },

        {
          provide: AccountStore,
          useValue: {
            accounts: signal([]),
            accountCount: signal(0),
            totalAssetBalance: signal(0),
            totalLiabilityBalance: signal(0),
            netWorth: signal(0),
          },
        },

        {
          provide: MatDialogRef,
          useValue: {
            close: jasmine.createSpy('close'),
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddDebt);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
