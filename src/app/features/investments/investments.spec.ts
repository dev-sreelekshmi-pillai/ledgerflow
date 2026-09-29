import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Investments } from './investments';
import { signal } from '@angular/core';
import { InvestmentStore } from './investment.store'; const investmentStoreMock = {
  investments: signal([]),
  investmentCount: signal(0),
  totalInvested: signal(0),
  totalCurrentValue: signal(0),
  totalGainLoss: signal(0),
  totalReturnPercentage: signal(0),
  getGainLoss: () => 0,
  getReturnPercentage: () => 0,
};
describe('Investments', () => {
  let component: Investments;
  let fixture: ComponentFixture<Investments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Investments], providers: [
        {
          provide: InvestmentStore,
          useValue: investmentStoreMock,
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Investments);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
