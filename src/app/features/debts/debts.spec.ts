import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Debts } from './debts';

describe('Debts', () => {
  let component: Debts;
  let fixture: ComponentFixture<Debts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Debts]
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
