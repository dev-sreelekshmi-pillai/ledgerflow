import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Login } from './login';
import { AuthService } from '../../../core/auth/auth.service';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  const authServiceMock = {
    login: jasmine.createSpy('login').and.resolveTo({
      uid: 'test-user',
      email: 'test@example.com',
    }),

    logout: jasmine.createSpy('logout').and.resolveTo(),

    register: jasmine.createSpy('register').and.resolveTo({
      uid: 'test-user',
      email: 'test@example.com',
    }),

    resetPassword: jasmine.createSpy('resetPassword').and.resolveTo(),

    currentUser: () => null,
    isAuthenticated: () => false,
    isLoading: () => false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
