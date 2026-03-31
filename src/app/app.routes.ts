import { Routes } from '@angular/router';
import { NotFoundComponent } from './not-found/not-found.component';
import { LoveComponent } from './love/love.component';

export const routes: Routes = [
  // 1. Not Found အတွက် သီးသန့် route (ဒါကို :id ရဲ့ အပေါ်မှာ ထားပါ)
  { path: 'not-found', component: NotFoundComponent },

  // 2. Dynamic ID (c01, c02 စသဖြင့်)
  { path: ':id', component: LoveComponent },

  // 3. Link အလွတ်နဲ့ ဝင်လာရင် not-found ကိုပဲ သွားမယ်
  { path: '', redirectTo: '/not-found', pathMatch: 'full' },

  // 4. တခြား ဘာရိုက်ရိုက် not-found ကို သွားမယ်
  { path: '**', redirectTo: '/not-found' }
];