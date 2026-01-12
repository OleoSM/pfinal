import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Order } from '../../../../core/models/order.model';
import { OrderItem } from '../../../../core/models/order-item.model';
import { OrderService } from '../../../../core/services/order.service';

@Component({
  selector: 'app-orders-page',
  templateUrl: './orders-page.component.html',
  styleUrls: ['./orders-page.component.scss'],
})
export class OrdersPageComponent implements OnInit {
  loading = false;
  orders: Order[] = [];

  displayedColumns = ['id', 'userId', 'status', 'grandTotal', 'actions'];

  form = this.fb.group({
    userId: [null as number | null, [Validators.required]],
    status: ['pending', [Validators.required]],
    grandTotal: [0, [Validators.required, Validators.min(0)]],
    shippingAddressId: [null as number | null],
    items: this.fb.array([] as any[]),
  });

  constructor(
    private fb: FormBuilder,
    private api: OrderService,
    private snack: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.addItem();
    this.refresh();
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  addItem(): void {
    this.items.push(
      this.fb.group({
        productVariantId: [1, [Validators.required, Validators.min(1)]],
        quantity: [1, [Validators.required, Validators.min(1)]],
        unitPrice: [0, [Validators.required, Validators.min(0)]],
        lineTotal: [0, [Validators.required, Validators.min(0)]],
      }),
    );
  }

  removeItem(i: number): void {
    if (this.items.length <= 1) return;
    this.items.removeAt(i);
  }

  refresh(): void {
    this.loading = true;
    this.api.getAll().subscribe({
      next: (rows) => (this.orders = rows),
      error: () => this.snack.open('No se pudieron cargar órdenes (¿backend arriba?)', 'OK', { duration: 3500 }),
      complete: () => (this.loading = false),
    });
  }

  create(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const items: OrderItem[] = this.items.controls.map((c: any) => ({
      productVariantId: Number(c.value.productVariantId),
      quantity: Number(c.value.quantity),
      unitPrice: Number(c.value.unitPrice),
      lineTotal: Number(c.value.lineTotal),
    }));

    const payload: Order = {
      userId: Number(this.form.value.userId),
      status: this.form.value.status!,
      grandTotal: Number(this.form.value.grandTotal),
      shippingAddressId: this.form.value.shippingAddressId ?? null,
      items,
    };

    this.api.create(payload).subscribe({
      next: () => {
        this.snack.open('Orden creada', 'OK', { duration: 2500 });
        this.form.reset({ userId: null, status: 'pending', grandTotal: 0, shippingAddressId: null, items: [] });
        while (this.items.length) this.items.removeAt(0);
        this.addItem();
        this.refresh();
      },
      error: (e) => {
        console.error(e);
        this.snack.open('Error al crear orden', 'OK', { duration: 3500 });
      },
    });
  }

  downloadPdf(orderId: number): void {
    this.api.downloadPdf(orderId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recibo_orden_${orderId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.snack.open('No se pudo descargar el PDF', 'OK', { duration: 3500 }),
    });
  }

  sendEmail(orderId: number): void {
    this.api.sendEmail(orderId).subscribe({
      next: (msg) => this.snack.open(msg || 'Correo enviado', 'OK', { duration: 3500 }),
      error: () => this.snack.open('No se pudo enviar el correo', 'OK', { duration: 3500 }),
    });
  }
}
