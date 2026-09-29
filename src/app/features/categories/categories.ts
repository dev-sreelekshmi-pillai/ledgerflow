import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { AddCategory } from './add-category/add-category';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { CategoryStore } from './category.store';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Categories {
  readonly categoryStore =
    inject(CategoryStore);

  private readonly dialog =
    inject(MatDialog);

  openAddCategory(): void {
    this.dialog.open(
      AddCategory,
      {
        width: '480px',
        maxWidth: '95vw',
      }
    );
  }
}
