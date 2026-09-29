import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Debts } from './debts';
import { PartyStore } from '../../state/party.store';
import { signal } from '@angular/core';
import { DebtStore } from '../../state/debt.store';

describe('Debts', () => {
  let component: Debts;
  let fixture: ComponentFixture<Debts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Debts], providers: [{
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
        },
      },
        {
          provide: PartyStore,
          useValue: {
            parties: signal([]),
            activeParties: signal([]),
            partyCount: signal(0),
            loadParties: jasmine.createSpy('loadParties'),
            getPartyById: jasmine.createSpy('getPartyById'),
          },
        },]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Debts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
