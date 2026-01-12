import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';

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
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { OrderService } from '../../core/services/order.service';
import { UserService } from '../../core/services/user.service';
import { ProductService } from '../../core/services/product.service';
import { Order } from '../../core/models/order.model';
import { User } from '../../core/models/user.model';
import { Product } from '../../core/models/product.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-orders',
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
    MatExpansionModule,
    MatDividerModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  loading = false;
  dataSource = new MatTableDataSource<Order>([]);
  users: User[] = [];
  products: Product[] = [];
  displayedColumns = ['id', 'user', 'items', 'total', 'status', 'actions'];
  form: FormGroup;
  showForm = false;
  editingId: number | null = null;
  statuses = ['pending', 'processing', 'completed', 'cancelled'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private userService: UserService,
    private productService: ProductService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.form = this.fb.group({
      userId: [null, Validators.required],
      status: ['pending', Validators.required],
      items: this.fb.array([])
    });
  }

  get itemsArray(): FormArray {
    return this.form.get('items') as FormArray;
  }

  ngOnInit(): void {
    this.loadOrders();
    this.loadUsers();
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getAll().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Error al cargar ordenes', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadUsers(): void {
    this.userService.getAll().subscribe({
      next: (data) => this.users = data,
      error: () => {}
    });
  }

  loadProducts(): void {
    this.productService.getAll().subscribe({
      next: (data) => this.products = data,
      error: () => {}
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
      this.form.reset({ status: 'pending' });
      this.itemsArray.clear();
      this.editingId = null;
    } else {
      this.addItem();
    }
  }

  editOrder(order: Order): void {
    this.editingId = order.id || null;
    this.itemsArray.clear();
    
    this.form.patchValue({
      userId: order.userId,
      status: order.status
    });

    if (order.items && order.items.length > 0) {
      order.items.forEach(item => {
        this.itemsArray.push(this.fb.group({
          productId: [item.productId, Validators.required],
          quantity: [item.quantity, [Validators.required, Validators.min(1)]],
          unitPrice: [item.unitPrice]
        }));
      });
    } else {
      this.addItem();
    }
    
    this.showForm = true;
  }

  deleteOrder(order: Order): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Orden',
        message: `Estas seguro de eliminar la orden #${order.id}?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && order.id) {
        this.orderService.delete(order.id).subscribe({
          next: () => {
            this.snackBar.open('Orden eliminada', 'Cerrar', { duration: 3000 });
            this.loadOrders();
          },
          error: () => {
            this.snackBar.open('Error al eliminar orden', 'Cerrar', { duration: 3000 });
          }
        });
      }
    });
  }

  addItem(): void {
    this.itemsArray.push(this.fb.group({
      productId: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0]
    }));
  }

  removeItem(index: number): void {
    this.itemsArray.removeAt(index);
  }

  onProductChange(index: number): void {
    const item = this.itemsArray.at(index);
    const product = this.products.find(p => p.id === item.get('productId')?.value);
    if (product) {
      item.get('unitPrice')?.setValue(product.basePrice || 0);
    }
  }

  calculateTotal(): number {
    return this.itemsArray.controls.reduce((sum, item) => {
      const qty = item.get('quantity')?.value || 0;
      const price = item.get('unitPrice')?.value || 0;
      return sum + (qty * price);
    }, 0);
  }

  onSubmit(): void {
    if (this.form.invalid || this.itemsArray.length === 0) {
      this.form.markAllAsTouched();
      if (this.itemsArray.length === 0) {
        this.snackBar.open('Agrega al menos un producto', 'Cerrar', { duration: 3000 });
      }
      return;
    }

    const order: Order = {
      userId: this.form.value.userId,
      status: this.form.value.status,
      grandTotal: this.calculateTotal(),
      items: this.itemsArray.controls.map(item => ({
        productVariantId: item.get('productId')?.value,
        quantity: item.get('quantity')?.value,
        unitPrice: item.get('unitPrice')?.value
      }))
    };

    if (this.editingId) {
      this.orderService.update(this.editingId, order).subscribe({
        next: () => {
          this.snackBar.open('Orden actualizada', 'Cerrar', { duration: 3000 });
          this.resetForm();
          this.loadOrders();
        },
        error: () => {
          this.snackBar.open('Error al actualizar orden', 'Cerrar', { duration: 3000 });
        }
      });
    } else {
      this.orderService.create(order).subscribe({
        next: () => {
          this.snackBar.open('Orden creada exitosamente', 'Cerrar', { duration: 3000 });
          this.resetForm();
          this.loadOrders();
        },
        error: () => {
          this.snackBar.open('Error al crear orden', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  resetForm(): void {
    this.form.reset({ status: 'pending' });
    this.itemsArray.clear();
    this.showForm = false;
    this.editingId = null;
  }

  downloadPdf(order: Order): void {
    if (!order.id) return;
    this.orderService.downloadPdf(order.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orden-${order.id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.snackBar.open('Error al descargar PDF', 'Cerrar', { duration: 3000 });
      }
    });
  }

  sendEmail(order: Order): void {
    if (!order.id) return;
    this.orderService.sendEmail(order.id).subscribe({
      next: () => {
        this.snackBar.open('Email enviado exitosamente', 'Cerrar', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Error al enviar email', 'Cerrar', { duration: 3000 });
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'info';
      case 'cancelled': return 'danger';
      default: return 'warning';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'completed': return 'Completada';
      case 'processing': return 'Procesando';
      case 'cancelled': return 'Cancelada';
      default: return 'Pendiente';
    }
  }

  getUserName(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user?.name || `Usuario #${userId}`;
  }
}
