import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  doc,
  setDoc,
} from '@angular/fire/firestore';

import { UserProfile } from '../../domain/user/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserProfileRepository {
  private readonly firestore = inject(Firestore);

  async create(profile: UserProfile): Promise<void> {
    const profileRef = doc(
      this.firestore,
      `users/${profile.uid}`
    );

    await setDoc(profileRef, profile);
  }
}
