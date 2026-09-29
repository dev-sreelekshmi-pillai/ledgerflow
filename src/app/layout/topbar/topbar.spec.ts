import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Topbar } from './topbar';
import { AuthService } from '../../core/auth/auth.service';

describe('Topbar', () => {
  let component: Topbar;
  let fixture: ComponentFixture<Topbar>;

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Topbar],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Topbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
