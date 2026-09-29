import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Parties } from './parties';
import { PartyStore } from '../../../state/party.store';
import { signal } from '@angular/core';

describe('Parties', () => {
  let component: Parties;
  let fixture: ComponentFixture<Parties>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Parties], providers: [{
        provide: PartyStore,
        useValue: {
          parties: signal([]),
          activeParties: signal([]),
          partyCount: signal(0),
          loadParties: jasmine.createSpy('loadParties'),
          getPartyById: jasmine.createSpy('getPartyById'),
          createParty: jasmine.createSpy('createParty'),
          updateParty: jasmine.createSpy('updateParty'),
          deactivateParty: jasmine.createSpy('deactivateParty'),
        },
      },]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Parties);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
