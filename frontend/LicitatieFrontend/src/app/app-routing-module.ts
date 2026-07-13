import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfilePage } from './profile/profile-page/profile-page'
import { Add } from './menu-item/add/add';
import { Edit } from './menu-item/edit/edit';
import { View } from './menu-item/view/view';

import { RegisterPage } from './menu-item/register-page/register-page';
import { LoginPage } from './menu-item/login-page/login-page';
import { AuctionItemPage } from './auction-item-page/auction-item-page';

const routes: Routes = [
  { path: 'login', component: LoginPage },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'register', component: RegisterPage },
  { path: '', redirectTo: '/register', pathMatch: 'full' },
  { path: 'add', component: Add},
 { path: 'edit', component: Edit},
 { path: 'view', component: View},
 { path: 'auction-item-page', component: AuctionItemPage},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
