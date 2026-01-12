import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Category } from '../../../../core/models/category.model';
import { Product } from '../../../../core/models/product.model';
import { CategoryService } from '../../../../core/services/category.service';
import { ProductService } from '../../../../core/services/product.service';

@Component({
  selector: 'app-products-page',
  templateUrl: './products-page.component.html',
  styleUrls: ['./products-page.component.scss'],
})
export class ProductsPageComponent implements OnInit {
  loading = false;
  products: Product[] = [];
  categories: Category[] = [];

  form = this.fb.group({
    categoryId: [null as number | null, [Validators.required]],
    name: ['', [Validators.required]],
    slug: [''],
    description: [''],
    basePrice: [0, [Validators.required, Validators.min(0)]],
    active: [true],
  });

  displayedColumns = ['id', 'name', 'category', 'basePrice', 'active'];

  constructor(
    private fb: FormBuilder,
    private productsApi: ProductService,
    private categoriesApi: CategoryService,
    private snack: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.refresh();
    this.categoriesApi.getAll().subscribe({
      next: (rows) => (this.categories = rows),
      error: () => this.snack.open('No se pudieron cargar categorías', 'OK', { duration: 3500 }),
    });
  }

  refresh(): void {
    this.loading = true;
    this.productsApi.getAll().subscribe({
      next: (rows) => (this.products = rows),
      error: () => this.snack.open('No se pudieron cargar productos (¿backend arriba?)', 'OK', { duration: 3500 }),
      complete: () => (this.loading = false),
    });
  }

  create(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const category = this.categories.find((c) => c.id === this.form.value.categoryId);
    if (!category) {
      this.snack.open('Selecciona una categoría válida', 'OK', { duration: 2500 });
      return;
    }

    const payload: Product = {
      category,
      name: this.form.value.name!,
      slug: this.form.value.slug || undefined,
      description: this.form.value.description || undefined,
      basePrice: Number(this.form.value.basePrice ?? 0),
      active: !!this.form.value.active,
    };

    this.productsApi.create(payload).subscribe({
      next: () => {
        this.snack.open('Producto creado', 'OK', { duration: 2500 });
        this.form.reset({ categoryId: null, name: '', slug: '', description: '', basePrice: 0, active: true });
        this.refresh();
      },
      error: (e) => {
        console.error(e);
        this.snack.open('Error al crear producto', 'OK', { duration: 3500 });
      },
    });
  }

  categoryName(p: Product): string {
    return p.category?.name || '-';
  }
}
