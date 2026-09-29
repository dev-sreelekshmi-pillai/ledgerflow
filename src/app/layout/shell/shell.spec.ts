import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Shell } from './shell';
import { AuthService } from '../../core/auth/auth.service';

describe('Shell', () => {
  let component: Shell;
  let fixture: ComponentFixture<Shell>;

  const authServiceMock = {
    currentUser: () => null,
    isAuthenticated: () => false,
    isLoading: () => false,

    login: jasmine.createSpy('login'),
    register: jasmine.createSpy('register'),
    logout: jasmine.createSpy('logout'),
    resetPassword: jasmine.createSpy('resetPassword'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Shell],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Shell);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
