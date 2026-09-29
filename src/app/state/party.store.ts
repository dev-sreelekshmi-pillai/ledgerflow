import {
  Injectable,
  computed,
  inject,
  signal,
} from '@angular/core';

import { AuthService } from '../core/auth/auth.service';
import {
  Party,
  PartyType,
} from '../domain/party/party.model';
import { PartyRepository } from '../infrastructure/repositories/party.repository';

@Injectable({
  providedIn: 'root',
})
export class PartyStore {
  private readonly partyRepository =
    inject(PartyRepository);

  private readonly authService =
    inject(AuthService);

  readonly parties = signal<Party[]>([]);

  readonly activeParties = computed(() =>
    this.parties().filter(
      (party) => party.isActive
    )
  );

  readonly partyCount = computed(
    () => this.activeParties().length
  );

  loadParties(): void {
    const user =
      this.authService.currentUser();

    if (!user) {
      this.parties.set([]);
      return;
    }

    this.partyRepository
      .getAll(user.uid)
      .subscribe({
        next: (parties) => {
          this.parties.set(parties);
        },

        error: (error) => {
          console.error(
            'Failed to load parties:',
            error
          );
        },
      });
  }

  async createParty(
    party: Party
  ): Promise<void> {
    const user =
      this.authService.currentUser();

    if (!user) {
      throw new Error(
        'You must be logged in to create a party.'
      );
    }

    if (party.userId !== user.uid) {
      throw new Error(
        'You cannot create a party for another user.'
      );
    }

    if (!party.name.trim()) {
      throw new Error(
        'Party name is required.'
      );
    }

    await this.partyRepository.create(
      party
    );
  }

  async updateParty(
    party: Party
  ): Promise<void> {
    const user =
      this.authService.currentUser();

    if (!user) {
      throw new Error(
        'You must be logged in to update a party.'
      );
    }

    if (party.userId !== user.uid) {
      throw new Error(
        'You cannot update another user\'s party.'
      );
    }

    if (!party.name.trim()) {
      throw new Error(
        'Party name is required.'
      );
    }

    await this.partyRepository.update(
      party
    );
  }

  async deactivateParty(
    party: Party
  ): Promise<void> {
    const user =
      this.authService.currentUser();

    if (!user) {
      throw new Error(
        'You must be logged in to update a party.'
      );
    }

    if (party.userId !== user.uid) {
      throw new Error(
        'You cannot update another user\'s party.'
      );
    }

    await this.partyRepository.update({
      ...party,
      isActive: false,
      updatedAt:
        new Date().toISOString(),
    });
  }

  getPartyById(
    partyId: string
  ): Party | undefined {
    return this.parties().find(
      (party) => party.id === partyId
    );
  }

  getPartiesByType(
    type: PartyType
  ): Party[] {
    return this.activeParties().filter(
      (party) => party.type === type
    );
  }
}
