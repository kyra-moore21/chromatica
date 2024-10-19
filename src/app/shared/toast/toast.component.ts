import { Component, OnInit } from '@angular/core';
import { ToastService } from '../toast/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
  imports: [CommonModule],
  standalone: true
})
export class ToastComponent implements OnInit {
  constructor(public toastService: ToastService) {}

  ngOnInit(): void {}

  removeToast(id: string) {
    this.toastService.removeToast(id);
  }
}
