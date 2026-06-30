import { Routes } from '@angular/router';
import { NotFoundComponent } from './not-found/not-found.component';
import { LoveComponent } from './love/love.component';

export const routes: Routes = [
  
  { path: 'not-found', component: NotFoundComponent },
 
  { path: ':id', component: LoveComponent },

  { path: '', redirectTo: '/not-found', pathMatch: 'full' },

  { path: '**', redirectTo: '/not-found' }
];