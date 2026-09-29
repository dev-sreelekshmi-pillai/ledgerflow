import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { AuthService } from '../../../core/auth/auth.service';
import {
  Party,
  PartyType,
} from '../../../domain/party/party.model';
import { PartyStore } from '../../../state/party.store';

@Component({
  selector: 'app-add-party',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './add-party.html',
  styleUrl: './add-party.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddParty {
  private readonly fb = inject(FormBuilder);

  private readonly authService =
    inject(AuthService);

  private readonly partyStore =
    inject(PartyStore);

  private readonly dialogRef =
    inject(MatDialogRef<AddParty>);

  readonly form =
    this.fb.nonNullable.group({
      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
        ],
      ],

      type: [
        'person' as PartyType,
        Validators.required,
      ],

      phone: [''],

      email: [
        '',
        Validators.email,
      ],

      notes: [''],
    });

  readonly partyTypes: {
    value: PartyType;
    label: string;
  }[] = [
      {
        value: 'person',
        label: 'Person',
      },
      {
        value: 'organization',
        label: 'Organization',
      },
      {
        value: 'other',
        label: 'Other',
      },
    ];

  saving = false;

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const user =
      this.authService.currentUser();

    if (!user) {
      return;
    }

    this.saving = true;

    const now =
      new Date().toISOString();

    const value =
      this.form.getRawValue();

    const party: Party = {
      id: crypto.randomUUID(),
      userId: user.uid,
      name: value.name.trim(),
      type: value.type,
      phone:
        value.phone.trim() || null,
      email:
        value.email.trim() || null,
      notes:
        value.notes.trim() || null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await this.partyStore.createParty(
        party
      );

      this.dialogRef.close(party);
    } finally {
      this.saving = false;
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
