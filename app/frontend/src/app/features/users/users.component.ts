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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-users',
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
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  loading = false;
  dataSource = new MatTableDataSource<User>([]);
  displayedColumns = ['id', 'name', 'email', 'role', 'phone', 'actions'];
  form: FormGroup;
  showForm = false;
  editingId: number | null = null;
  roles = ['admin', 'customer', 'staff'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      passwordHash: ['', [Validators.required, Validators.minLength(6)]],
      role: ['customer', Validators.required],
      phone: ['']
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAll().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Error al cargar usuarios', 'Cerrar', { duration: 3000 });
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
      this.form.reset({ role: 'customer' });
      this.editingId = null;
      // Restore password required validation
      this.form.get('passwordHash')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.form.get('passwordHash')?.updateValueAndValidity();
    }
  }

  editUser(user: User): void {
    this.editingId = user.id || null;
    this.form.patchValue({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      passwordHash: ''
    });
    // Password is optional when editing
    this.form.get('passwordHash')?.clearValidators();
    this.form.get('passwordHash')?.setValidators([Validators.minLength(6)]);
    this.form.get('passwordHash')?.updateValueAndValidity();
    this.showForm = true;
  }

  deleteUser(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Usuario',
        message: `Estas seguro de eliminar al usuario "${user.name}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && user.id) {
        this.userService.delete(user.id).subscribe({
          next: () => {
            this.snackBar.open('Usuario eliminado', 'Cerrar', { duration: 3000 });
            this.loadUsers();
          },
          error: () => {
            this.snackBar.open('Error al eliminar usuario', 'Cerrar', { duration: 3000 });
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

    const user: User = {
      name: this.form.value.name,
      email: this.form.value.email,
      role: this.form.value.role,
      phone: this.form.value.phone
    };

    // Only include password if provided
    if (this.form.value.passwordHash) {
      user.passwordHash = this.form.value.passwordHash;
    }

    if (this.editingId) {
      this.userService.update(this.editingId, user).subscribe({
        next: () => {
          this.snackBar.open('Usuario actualizado', 'Cerrar', { duration: 3000 });
          this.resetForm();
          this.loadUsers();
        },
        error: () => {
          this.snackBar.open('Error al actualizar usuario', 'Cerrar', { duration: 3000 });
        }
      });
    } else {
      this.userService.create(user).subscribe({
        next: () => {
          this.snackBar.open('Usuario creado exitosamente', 'Cerrar', { duration: 3000 });
          this.resetForm();
          this.loadUsers();
        },
        error: () => {
          this.snackBar.open('Error al crear usuario', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  resetForm(): void {
    this.form.reset({ role: 'customer' });
    this.showForm = false;
    this.editingId = null;
    this.form.get('passwordHash')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.form.get('passwordHash')?.updateValueAndValidity();
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'admin': return 'danger';
      case 'staff': return 'warning';
      default: return 'info';
    }
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'staff': return 'Staff';
      default: return 'Cliente';
    }
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
