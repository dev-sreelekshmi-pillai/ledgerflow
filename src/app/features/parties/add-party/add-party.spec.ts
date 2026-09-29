import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddParty } from './add-party';
import { provideAuth } from '@angular/fire/auth';
import { AuthService } from '../../../core/auth/auth.service';
import { PartyStore } from '../../../state/party.store';
import { signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
describe('AddParty', () => {
  let component: AddParty;
  let fixture: ComponentFixture<AddParty>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddParty],
      providers: [{
        provide: AuthService,
        useValue: {
          currentUser: () => ({
            uid: 'test-user',
          }),
        },
      }, {
          provide: PartyStore,
          useValue: {
            parties: signal([]),
            activeParties: signal([]),
            partyCount: signal(0),
            loadParties: jasmine.createSpy('loadParties'),
            getPartyById: jasmine.createSpy('getPartyById'),
            createParty: jasmine
              .createSpy('createParty')
              .and.resolveTo(),
            updateParty: jasmine.createSpy('updateParty'),
            deactivateParty: jasmine.createSpy('deactivateParty'),
          },
        }, {
          provide: MatDialogRef,
          useValue: {
            close: jasmine.createSpy('close'),
          },
        },],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddParty);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
