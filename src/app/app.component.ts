import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { ToastComponent } from "./shared/toast/toast.component";
import { App } from '@capacitor/app';
import { SupabaseService } from './services/supabase.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'chromatica';
  constructor(private supabase: SupabaseService) {}
  ngOnInit(): void {
    App.addListener('appUrlOpen', async (data: any) => {
      console.log('App opened with URL:', data.url);
      if (data.url && data.url.includes('chromatica://callback')) {
        console.log('Handling deep link');

        // Extract the access token from the URL fragment
        const accessToken = data.url.split('#access_token=')[1]?.split('&')[0];
        const refreshToken = data.url.split('refresh_token=')[1]?.split('&')[0];
        const providerToken = data.url.split('provider_token=')[1]?.split('&')[0];
        
        if (accessToken && refreshToken) {
          console.log('Access Token:', accessToken);
          console.log('Refresh Token:', refreshToken);
          console.log('Provider Token:', providerToken);

          // Set the session manually in Supabase
          const { error } = await this.supabase.getClient().auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Failed to set session:', error.message);
          } else {
            console.log('Session set successfully');
          }
        } else {
          console.error('No access token found in the URL');
        }
      }
    });
  }
}
