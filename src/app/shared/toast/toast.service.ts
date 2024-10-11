import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toasts: any[] = [];

  constructor() {}

  showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration: number = 5000) {
    const id = Math.random().toString(36).substr(2, 9);
    const toast = { id, message, type };
    this.toasts.push(toast);

    setTimeout(() => {
      this.removeToast(id);
    }, duration);
  }

  getToasts() {
    return this.toasts;
  }

  removeToast(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }
}
