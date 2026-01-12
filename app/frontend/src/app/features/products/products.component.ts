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
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-products',
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
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatDialogModule,
    MatTooltipModule,
    MatSlideToggleModule
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  loading = false;
  dataSource = new MatTableDataSource<Product>([]);
  categories: Category[] = [];
  displayedColumns = ['id', 'name', 'category', 'price', 'status', 'actions'];
  form: FormGroup;
  showForm = false;
  editingId: number | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.form = this.fb.group({
      categoryId: [null, Validators.required],
      name: ['', [Validators.required, Validators.minLength(2)]],
      slug: [''],
      description: [''],
      basePrice: [0, [Validators.required, Validators.min(0)]],
      active: [true]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAll().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Error al cargar productos', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (data) => this.categories = data,
      error: () => this.snackBar.open('Error al cargar categorias', 'Cerrar', { duration: 3000 })
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
      this.form.reset({ active: true, basePrice: 0 });
      this.editingId = null;
    }
  }

  editProduct(product: Product): void {
    this.editingId = product.id || null;
    this.form.patchValue({
      categoryId: product.category?.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      basePrice: product.basePrice,
      active: product.active
    });
    this.showForm = true;
  }

  deleteProduct(product: Product): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Producto',
        message: `Estas seguro de eliminar el producto "${product.name}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && product.id) {
        this.productService.delete(product.id).subscribe({
          next: () => {
            this.snackBar.open('Producto eliminado', 'Cerrar', { duration: 3000 });
            this.loadProducts();
          },
          error: () => {
            this.snackBar.open('Error al eliminar producto', 'Cerrar', { duration: 3000 });
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

    const category = this.categories.find(c => c.id === this.form.value.categoryId);
    if (!category) {
      this.snackBar.open('Selecciona una categoria valida', 'Cerrar', { duration: 3000 });
      return;
    }

    const product: Product = {
      category,
      name: this.form.value.name,
      slug: this.form.value.slug || this.generateSlug(this.form.value.name),
      description: this.form.value.description,
      basePrice: this.form.value.basePrice,
      active: this.form.value.active
    };

    if (this.editingId) {
      this.productService.update(this.editingId, product).subscribe({
        next: () => {
          this.snackBar.open('Producto actualizado', 'Cerrar', { duration: 3000 });
          this.resetForm();
          this.loadProducts();
        },
        error: () => {
          this.snackBar.open('Error al actualizar producto', 'Cerrar', { duration: 3000 });
        }
      });
    } else {
      this.productService.create(product).subscribe({
        next: () => {
          this.snackBar.open('Producto creado exitosamente', 'Cerrar', { duration: 3000 });
          this.resetForm();
          this.loadProducts();
        },
        error: () => {
          this.snackBar.open('Error al crear producto', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  resetForm(): void {
    this.form.reset({ active: true, basePrice: 0 });
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
