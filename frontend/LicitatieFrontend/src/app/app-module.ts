import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';

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
import { AddItemPage } from './add-item-page/add-item-page';

import { AuthInterceptor } from './services/auth-interceptor';
import { AddItem } from './add-item/add-item';
import { ForumPostDetails } from './forum-page/forum-post-details/forum-post-details';
import { CreateForumPost } from './forum-page/create-forum-post/create-forum-post';
import { Footer } from './app-logic/footer/footer';
import { AuctionItemPage } from './auction-item-page/auction-item-page';
import { Add } from './menu-item/add/add';
import { Edit } from './menu-item/edit/edit';
import { View } from './menu-item/view/view';
import { NotFound } from './not-found/not-found';
import { MatMenuModule } from '@angular/material/menu';
import { ProfileMenu } from './menu-item/profile-menu/profile-menu';
import { NotificationBell } from './menu-item/notification-bell/notification-bell';
import { MatBadgeModule } from '@angular/material/badge';
import { provideTranslateService, TranslateDirective, TranslatePipe } from '@ngx-translate/core';

import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { AdminPage } from './admin-page/admin-page/admin-page';

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
    AddItemPage,
    AuctionItemPage,
    Add,
    Edit,
    View,
    AuctionDetail,
    ShareListingButton,
    AddItem,
    ForumPostDetails,
    CreateForumPost,
    AuctionDetail,
    Footer,
    NotFound,
    ProfileMenu,
    NotificationBell,
    AdminPage,
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
    ReviewComponent,
    HelpPageComponent,
    DatePipe,
    MatMenuModule,
    MatBadgeModule,
    TranslatePipe,
    TranslateDirective,
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptorsFromDi()),
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
  bootstrap: [App],
})
export class AppModule {}
