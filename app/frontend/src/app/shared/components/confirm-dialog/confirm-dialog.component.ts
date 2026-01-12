import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <div class="dialog-header" [ngClass]="data.type || 'warning'">
        <mat-icon>{{ getIcon() }}</mat-icon>
      </div>
      <h2 mat-dialog-title>{{ data.title }}</h2>
      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">{{ data.cancelText || 'Cancelar' }}</button>
        <button mat-raised-button [color]="data.type === 'danger' ? 'warn' : 'primary'" (click)="onConfirm()">
          {{ data.confirmText || 'Confirmar' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      text-align: center;
      padding: 8px;
    }
    .dialog-header {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
    }
    .dialog-header.warning {
      background: #fef3c7;
      color: #f59e0b;
    }
    .dialog-header.danger {
      background: #fee2e2;
      color: #ef4444;
    }
    .dialog-header.info {
      background: #dbeafe;
      color: #3b82f6;
    }
    .dialog-header mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }
    h2 {
      margin: 0 0 8px;
      font-size: 20px;
      font-weight: 600;
    }
    p {
      color: #6b7280;
      margin: 0;
    }
    mat-dialog-actions {
      margin-top: 24px;
      padding: 0;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  getIcon(): string {
    switch (this.data.type) {
      case 'danger': return 'error_outline';
      case 'info': return 'info_outline';
      default: return 'warning_amber';
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
