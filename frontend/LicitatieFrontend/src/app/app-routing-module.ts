import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfilePage } from './profile/profile-page/profile-page'
import { Add } from './menu-item/add/add';
import { Edit } from './menu-item/edit/edit';
import { View } from './menu-item/view/view';

import { RegisterPage } from './menu-item/register-page/register-page';
import { LoginPage } from './menu-item/login-page/login-page';
import { HomePage } from './home-page/home-page';
import { ContactPage } from './menu-item/contact-page/contact-page';
import { AuctionItemPage } from './auction-item-page/auction-item-page';

const routes: Routes = [
  { path: 'home-page', component: HomePage },
  { path: 'login-page', component: LoginPage },
  { path: 'register-page', component: RegisterPage },
  { path: 'contact-page', component: ContactPage },
  { path: '', redirectTo: '/register', pathMatch: 'full' },
   { path: 'add', component: Add},
 { path: 'edit', component: Edit},
 { path: 'view', component: View},
 { path: 'action-item-page', component: AuctionItemPage},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
