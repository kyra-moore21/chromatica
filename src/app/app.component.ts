import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { ToastComponent } from "./shared/toast/toast.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'chromatica';
  constructor() {}
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
}
