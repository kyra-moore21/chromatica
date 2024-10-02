import { Routes } from '@angular/router';
import { TabsComponent } from './components/tabs/tabs.component';


export const routes: Routes = [
    {
        path: '',
        component: TabsComponent,
        children: [
            {
                path: 'home',
                loadComponent: () => import('./components/homepage/homepage.component').then(m => m.HomepageComponent)
            },
            {
                path: 'history',
                loadComponent: () => import('./components/history/history.component').then(m => m.HistoryComponent)
            },
            {
                path: 'social',
                loadComponent: () => import('./components/social/social.component').then(m => m.SocialComponent)
            },
            {
                path: 'profile',
                loadComponent: () => import('./components/profile/profile.component').then (m => m.ProfileComponent)
            },
            {
                path: '',
                redirectTo: 'home',
                pathMatch: 'full'
            }


           
        ]
    },
    {
        path: 'form',
        loadComponent: () => import('./components/form/form.component').then(m => m.FormComponent),
    },
    {
        path: '',
        redirectTo: 'tabs',
        pathMatch: 'full'
    }
];
