import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { PartyStore } from '../../../state/party.store';
import { AddParty } from '../add-party/add-party';

@Component({
  selector: 'app-parties',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
  ],
  templateUrl: './parties.html',
  styleUrl: './parties.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Parties implements OnInit {
  readonly partyStore = inject(PartyStore);

  private readonly dialog = inject(MatDialog);

  ngOnInit(): void {
    this.partyStore.loadParties();
  }

  openAddParty(): void {
    this.dialog.open(AddParty, {
      width: '480px',
      maxWidth: '95vw',
    });
  }

  async deactivateParty(
    partyId: string
  ): Promise<void> {
    const party =
      this.partyStore.getPartyById(partyId);

    if (!party) {
      return;
    }

    const confirmed = window.confirm(
      `Deactivate ${party.name}?`
    );

    if (!confirmed) {
      return;
    }

    await this.partyStore.deactivateParty(
      party
    );
  }
}
