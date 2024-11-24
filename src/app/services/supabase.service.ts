import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { Database } from '../models/database.types';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private authState = new BehaviorSubject<any>(null); // BehaviorSubject to hold the latest auth state

  constructor() {
    this.supabase = createClient<Database>(
      'https://ifnsuywocfgtyzqqixss.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmbnN1eXdvY2ZndHl6cXFpeHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY2OTY0NzUsImV4cCI6MjA0MjI3MjQ3NX0.gLwf4eicZx59N0_HG9zQfRepNg5TRNj9RG1Z-vfbrco'
    );

    // Set up auth state change listener
    this.supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event);
      this.authState.next({ event, session }); // Update BehaviorSubject with the latest auth state
    });
  }

  // Method to access the client directly
  getClient(): SupabaseClient {
    return this.supabase;
  }

  // Observable for components to subscribe to auth changes
  get authState$() {
    return this.authState.asObservable();
  }

  // Auth methods
  signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  signInWithSpotify(redirectUri?: string) {
    return this.supabase.auth.signInWithOAuth({
      provider: 'spotify',
      options: {
        scopes:
          'user-library-modify playlist-read-collaborative playlist-read-private playlist-modify-public playlist-modify-private user-read-email user-read-private user-read-playback-position user-top-read ugc-image-upload',
        redirectTo: redirectUri,
      },
    });
  }

  signUp(email: string, password: string) {
    return this.supabase.auth.signUp({ email, password });
  }

  signOut() {
    return this.supabase.auth.signOut();
  }

  getSession() {
    return this.supabase.auth.getSession();
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    this.supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        this.updateTokens(session);
      } else if (event === 'SIGNED_OUT') {
        this.clearTokens();
      } else if (event === 'USER_UPDATED') {
      }
      callback(event, session);
    });
  }

  private updateTokens(session: any) {
    if (session && session.provider_token) {
      window.localStorage.setItem(
        'oauth_provider_token',
        session.provider_token
      );
    }
    if (session && session.provider_refresh_token) {
      window.localStorage.setItem(
        'oauth_refresh_token',
        session.provider_refresh_token
      );
    }
  }

  private clearTokens() {
    window.localStorage.removeItem('oauth_provider_token');
    window.localStorage.removeItem('oauth_refresh_token');
  }
}
