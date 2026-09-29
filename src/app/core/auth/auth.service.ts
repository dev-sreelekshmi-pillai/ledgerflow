import { Injectable, computed, inject } from '@angular/core';
import {
  Auth,
  User,
  authState,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from '@angular/fire/auth';

import { Observable } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly auth = inject(Auth);

  // Firebase authentication state
  readonly user$: Observable<User | null> = authState(this.auth);

  // undefined = Firebase is still determining auth state
  // null      = no authenticated user
  // User      = authenticated user
  readonly currentUser = toSignal(this.user$, {
    initialValue: undefined,
  });

  readonly isLoading = computed(
    () => this.currentUser() === undefined
  );

  readonly isAuthenticated = computed(
    () => this.currentUser() !== null &&
      this.currentUser() !== undefined
  );

  async login(email: string, password: string): Promise<User> {
    const credential =
      await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );

    return credential.user;
  }

  async register(
    email: string,
    password: string
  ): Promise<User> {
    const credential =
      await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );

    return credential.user;
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(
      this.auth,
      email
    );
  }
}
