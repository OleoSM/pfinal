import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../../../../core/models/user.model';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-users-page',
  templateUrl: './users-page.component.html',
  styleUrls: ['./users-page.component.scss'],
})
export class UsersPageComponent implements OnInit {
  loading = false;
  users: User[] = [];

  roles = ['admin', 'customer', 'staff'];

  form = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    passwordHash: ['', [Validators.required]],
    role: ['customer', [Validators.required]],
    phone: [''],
  });

  displayedColumns = ['id', 'name', 'email', 'role', 'phone'];

  constructor(
    private fb: FormBuilder,
    private api: UserService,
    private snack: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.api.getAll().subscribe({
      next: (rows) => (this.users = rows),
      error: () => this.snack.open('No se pudieron cargar usuarios (¿backend arriba?)', 'OK', { duration: 3500 }),
      complete: () => (this.loading = false),
    });
  }

  create(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: User = {
      name: this.form.value.name!,
      email: this.form.value.email!,
      passwordHash: this.form.value.passwordHash!,
      role: this.form.value.role!,
      phone: this.form.value.phone || undefined,
    };

    this.api.create(payload).subscribe({
      next: () => {
        this.snack.open('Usuario creado', 'OK', { duration: 2500 });
        this.form.reset({ name: '', email: '', passwordHash: '', role: 'customer', phone: '' });
        this.refresh();
      },
      error: (e) => {
        console.error(e);
        this.snack.open('Error al crear usuario (¿email duplicado?)', 'OK', { duration: 3500 });
      },
    });
  }
}
