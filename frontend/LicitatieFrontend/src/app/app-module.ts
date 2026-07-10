import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { ProfilePage } from './profile/profile-page/profile-page';

import { RegisterPage } from './menu-item/register-page/register-page';
import { LoginPage } from './menu-item/login-page/login-page';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [App, LoginPage, RegisterPage],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],

  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [App],
})
export class AppModule { }
