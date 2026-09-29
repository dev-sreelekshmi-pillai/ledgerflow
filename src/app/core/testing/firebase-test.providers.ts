import {
  provideFirebaseApp,
} from '@angular/fire/app';

import {
  provideAuth,
} from '@angular/fire/auth';

import {
  initializeApp,
} from 'firebase/app';

import {
  getAuth,
} from 'firebase/auth';

import { environment } from '../../../environments/environment';

export const firebaseTestProviders = [
  provideFirebaseApp(() =>
    initializeApp(environment.firebase)
  ),

  provideAuth(() =>
    getAuth()
  ),
];
