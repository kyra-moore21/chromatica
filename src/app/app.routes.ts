import { Routes } from '@angular/router';
import { TabsComponent } from './components/tabs/tabs.component';
import { AuthGuard } from './shared/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./components/pass-forgot/pass-forgot.component').then(
        (m) => m.PassForgotComponent
      ),
  },
  {
    path: 'choose-username',
    loadComponent: () =>
      import('./components/choose-username/choose-username.component').then(
        (m) => m.ChooseUsernameComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'tabs',
    component: TabsComponent,
    canActivate: [AuthGuard], // Protect the TabsComponent itself
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./components/homepage/homepage.component').then(
            (m) => m.HomepageComponent
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./components/history/history.component').then(
            (m) => m.HistoryComponent
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'social',
        loadComponent: () =>
          import('./components/social/social.component').then(
            (m) => m.SocialComponent
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./components/profile/profile.component').then(
            (m) => m.ProfileComponent
          ),
        canActivate: [AuthGuard],
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'form',
    loadComponent: () =>
      import('./components/form/form.component').then((m) => m.FormComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'song-results',
    loadComponent: () =>
      import('./components/song-results/song-results.component').then(
        (m) => m.SongResultsComponent
      ),
  },
  {
    path: '**',
    redirectTo: 'login', // Catch-all route for undefined paths, redirect to login
  },
];
