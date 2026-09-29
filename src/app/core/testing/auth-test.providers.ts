import { Auth } from '@angular/fire/auth';

export const mockAuth = {} as Auth;

export const authTestProviders = [
  {
    provide: Auth,
    useValue: mockAuth,
  },
];
