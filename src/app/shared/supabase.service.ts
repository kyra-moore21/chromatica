import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient('https://ifnsuywocfgtyzqqixss.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmbnN1eXdvY2ZndHl6cXFpeHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY2OTY0NzUsImV4cCI6MjA0MjI3MjQ3NX0.gLwf4eicZx59N0_HG9zQfRepNg5TRNj9RG1Z-vfbrco');

  }

  signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  signInWithSpotify() {
    return this.supabase.auth.signInWithOAuth({
      provider: 'spotify',
    })
  }

  signUp(email: string, password: string, username: string) {
    return this.supabase.auth.signUp({ email, password, options: { data: { display_name: username } } });
  }

  signOut() {
    return this.supabase.auth.signOut();
  }

  forgotPass(email: string) {
    return this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "localhost:4200/"
    })
  }

  getSession() {
    return this.supabase.auth.getSession();
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    this.supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }
}
