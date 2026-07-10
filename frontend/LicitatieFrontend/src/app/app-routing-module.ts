import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RegisterPage } from './menu-item/register-page/register-page';
import { LoginPage } from './menu-item/login-page/login-page';

const routes: Routes = [
  { path: 'login', component: LoginPage },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'register', component: RegisterPage },
  { path: '', redirectTo: '/register', pathMatch: 'full' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
