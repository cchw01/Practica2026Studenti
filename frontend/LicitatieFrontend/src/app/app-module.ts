import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { ShareListingButton } from './shared/share-listing-button/share-listing-button';
import { AuctionDetail } from './auctions-page/auction-detail/auction-detail';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { ProfilePage } from './menu-item/profile-page/profile-page';
import { RegisterPage } from './menu-item/register-page/register-page';
import { LoginPage } from './menu-item/login-page/login-page';
import { ContactPage } from './menu-item/contact-page/contact-page';
import { HomePage } from './home-page/home-page';
import { AuctionsPage } from './auctions-page/auctions-page';
import { HelpPageComponent } from './menu-item/help-page/help-page';
import { ForumPage } from './forum-page/forum-page';
import { ReviewComponent } from './Models/review/review';


import { AuthInterceptor } from './services/auth-interceptor';
import { Footer } from './app-logic/footer/footer';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    App,
    LoginPage,
    RegisterPage,
    HomePage,
    ProfilePage,
    ContactPage,
    ForumPage,
    AuctionsPage,
    ShareListingButton,
    AuctionDetail,
    Footer,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    ReviewComponent,
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [App],
})
export class AppModule {}
