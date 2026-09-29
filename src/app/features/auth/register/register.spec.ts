import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Register } from './register';
import { AuthService } from '../../../core/auth/auth.service';
import { UserProfileRepository } from '../../../infrastructure/repositories/user-profile.repository';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;

  const authServiceMock = {
    login: jasmine.createSpy('login').and.resolveTo({
      uid: 'test-user',
      email: 'test@example.com',
    }),

    register: jasmine.createSpy('register').and.resolveTo({
      uid: 'test-user',
      email: 'test@example.com',
    }),

    logout: jasmine.createSpy('logout').and.resolveTo(),

    resetPassword: jasmine.createSpy('resetPassword').and.resolveTo(),

    currentUser: () => null,
    isAuthenticated: () => false,
    isLoading: () => false,
  };

  const userProfileRepositoryMock = {
    create: jasmine.createSpy('create').and.resolveTo(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        provideRouter([]),

        {
          provide: AuthService,
          useValue: authServiceMock,
        },

        {
          provide: UserProfileRepository,
          useValue: userProfileRepositoryMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
