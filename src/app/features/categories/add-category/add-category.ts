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

import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { CategoryStore } from '../category.store';

@Component({
  selector: 'app-add-category',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './add-category.html',
  styleUrl: './add-category.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddCategory {
  private readonly fb = inject(FormBuilder);

  private readonly dialogRef =
    inject(MatDialogRef<AddCategory>);

  private readonly categoryStore =
    inject(CategoryStore);

  readonly form = this.fb.nonNullable.group({
    name: this.fb.nonNullable.control(
      '',
      [
        Validators.required,
        Validators.maxLength(50),
      ]
    ),

    icon: this.fb.nonNullable.control(
      'category',
      [
        Validators.required,
        Validators.maxLength(50),
      ]
    ),

    color: this.fb.nonNullable.control(
      '#2563eb',
      Validators.required
    ),
  });

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const user =
      this.categoryStore.currentUser();

    if (!user) {
      return;
    }

    const value =
      this.form.getRawValue();

    const now =
      new Date().toISOString();

    const category = {
      id: crypto.randomUUID(),
      userId: user.uid,
      name: value.name.trim(),
      icon: value.icon.trim(),
      color: value.color,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await this.categoryStore.createCategory(
        category
      );

      this.dialogRef.close(true);
    } catch (error) {
      console.error(
        'Failed to create category:',
        error
      );
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
