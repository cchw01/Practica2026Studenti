import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfilePage } from './profile/profile-page/profile-page';
import { RegisterPage } from './menu-item/register-page/register-page';
import { LoginPage } from './menu-item/login-page/login-page';
import { HomePage } from './home-page/home-page';
import { AuctionsPage } from './auctions-page/auctions-page';

const routes: Routes = [

  {path: 'home-page', component: HomePage},
  { path: 'login-page', component: LoginPage },
  { path: 'register-page', component: RegisterPage },
  { path: '', redirectTo: '/register', pathMatch: 'full' },
  { path: 'auctions', component: AuctionsPage },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
