import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Category } from '../../../../core/models/category.model';
import { CategoryService } from '../../../../core/services/category.service';

@Component({
  selector: 'app-categories-page',
  templateUrl: './categories-page.component.html',
  styleUrls: ['./categories-page.component.scss'],
})
export class CategoriesPageComponent implements OnInit {
  loading = false;
  categories: Category[] = [];

  form = this.fb.group({
    name: ['', [Validators.required]],
    slug: [''],
    description: [''],
    parentId: [null as number | null],
  });

  displayedColumns = ['id', 'name', 'slug', 'parentId', 'description'];

  constructor(
    private fb: FormBuilder,
    private api: CategoryService,
    private snack: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.api.getAll().subscribe({
      next: (rows) => (this.categories = rows),
      error: () => this.snack.open('No se pudieron cargar categorías (¿backend arriba?)', 'OK', { duration: 3500 }),
      complete: () => (this.loading = false),
    });
  }

  create(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload: Category = {
      name: this.form.value.name!,
      slug: this.form.value.slug || undefined,
      description: this.form.value.description || undefined,
      parentId: this.form.value.parentId ?? null,
    };

    this.api.create(payload).subscribe({
      next: () => {
        this.snack.open('Categoría creada', 'OK', { duration: 2500 });
        this.form.reset({ name: '', slug: '', description: '', parentId: null });
        this.refresh();
      },
      error: (e) => {
        console.error(e);
        this.snack.open('Error al crear categoría', 'OK', { duration: 3500 });
      },
    });
  }
}
