import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  deleteDoc,
  doc,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

import { Party } from '../../domain/party/party.model';

@Injectable({
  providedIn: 'root',
})
export class PartyRepository {
  private readonly firestore = inject(Firestore);

  getAll(userId: string): Observable<Party[]> {
    const partiesRef = collection(
      this.firestore,
      `users/${userId}/parties`
    );

    const partiesQuery = query(
      partiesRef,
      where('userId', '==', userId),
      orderBy('name', 'asc')
    );

    return collectionData(partiesQuery, {
      idField: 'id',
    }) as Observable<Party[]>;
  }

  async create(
    party: Party
  ): Promise<void> {
    const partyRef = doc(
      this.firestore,
      `users/${party.userId}/parties/${party.id}`
    );

    await setDoc(partyRef, party);
  }

  async update(
    party: Party
  ): Promise<void> {
    const partyRef = doc(
      this.firestore,
      `users/${party.userId}/parties/${party.id}`
    );

    await updateDoc(partyRef, {
      ...party,
      updatedAt: new Date().toISOString(),
    });
  }

  async delete(
    userId: string,
    partyId: string
  ): Promise<void> {
    const partyRef = doc(
      this.firestore,
      `users/${userId}/parties/${partyId}`
    );

    await deleteDoc(partyRef);
  }
}
