import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AppRoutingModule } from './app-routing-module';
import { HttpClientModule } from '@angular/common/http';

import { App } from './app';
import { HomePage } from './home-page/home-page';
import { ProfilePage } from './profile/profile-page/profile-page';
import { RegisterPage } from './menu-item/register-page/register-page';
import { LoginPage } from './menu-item/login-page/login-page';
import { ContactPage } from './menu-item/contact-page/contact-page'
import { ForumPage } from './forum-page/forum-page'
import { Add } from './menu-item/add/add';
import { AuctionsPage } from './auctions-page/auctions-page';


@NgModule({
  declarations: [App, LoginPage, RegisterPage, HomePage, ProfilePage, ContactPage, ForumPage, Add, AuctionsPage],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    HttpClientModule,
  ],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [App],
})
export class AppModule {}
