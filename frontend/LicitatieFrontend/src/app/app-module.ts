import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HTTP_INTERCEPTORS,  provideHttpClient,  withInterceptorsFromDi} from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';


import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import {  provideTranslateService,  TranslateDirective,  TranslatePipe } from '@ngx-translate/core';

import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
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
    AuctionDetail,
    ShareListingButton,
  ],

  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    AppRoutingModule,

    FormsModule,
    ReactiveFormsModule,

    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReviewComponent,
    TranslatePipe,
    TranslateDirective,
  ],

  providers: [
    provideBrowserGlobalErrorListeners(),

    provideHttpClient(
      withInterceptorsFromDi()
    ),

    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },

    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: './i18n/',
        suffix: '.json',
        failOnError: true,
      }),

      fallbackLang: 'en',
      lang: 'en',
    }),
  ],
  bootstrap: [App]
})
export class AppModule { }