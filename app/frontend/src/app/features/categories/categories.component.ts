import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models/category.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  loading = false;
  dataSource = new MatTableDataSource<Category>([]);
  displayedColumns = ['id', 'name', 'slug', 'description', 'actions'];
  form: FormGroup;
  showForm = false;
  editingId: number | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      slug: [''],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getAll().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Error al cargar categorias', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.form.reset();
      this.editingId = null;
    }
  }

  editCategory(category: Category): void {
    this.editingId = category.id || null;
    this.form.patchValue({
      name: category.name,
      slug: category.slug,
      description: category.description
    });
    this.showForm = true;
  }

  deleteCategory(category: Category): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Categoria',
        message: `Estas seguro de eliminar la categoria "${category.name}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && category.id) {
        this.categoryService.delete(category.id).subscribe({
          next: () => {
            this.snackBar.open('Categoria eliminada', 'Cerrar', { duration: 3000 });
            this.loadCategories();
          },
          error: () => {
            this.snackBar.open('Error al eliminar categoria', 'Cerrar', { duration: 3000 });
          }
        });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const category: Category = {
      name: this.form.value.name,
      slug: this.form.value.slug || this.generateSlug(this.form.value.name),
      description: this.form.value.description
    };

    if (this.editingId) {
      this.categoryService.update(this.editingId, category).subscribe({
        next: () => {
          this.snackBar.open('Categoria actualizada', 'Cerrar', { duration: 3000 });
          this.resetForm();
          this.loadCategories();
        },
        error: () => {
          this.snackBar.open('Error al actualizar categoria', 'Cerrar', { duration: 3000 });
        }
      });
    } else {
      this.categoryService.create(category).subscribe({
        next: () => {
          this.snackBar.open('Categoria creada exitosamente', 'Cerrar', { duration: 3000 });
          this.resetForm();
          this.loadCategories();
        },
        error: () => {
          this.snackBar.open('Error al crear categoria', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  resetForm(): void {
    this.form.reset();
    this.showForm = false;
    this.editingId = null;
  }

  generateSlug(name: string): string {
    return name.toLowerCase()
      .replace(/[aàäâ]/g, 'a')
      .replace(/[eèëê]/g, 'e')
      .replace(/[iìïî]/g, 'i')
      .replace(/[oòöô]/g, 'o')
      .replace(/[uùüû]/g, 'u')
      .replace(/n/g, 'n')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
