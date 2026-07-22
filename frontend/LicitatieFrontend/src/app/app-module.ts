import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

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
import { AddItem } from './add-item/add-item';
import { ForumPostDetails } from './forum-page/forum-post-details/forum-post-details';
import { CreateForumPost } from './forum-page/create-forum-post/create-forum-post';
import { Footer } from './app-logic/footer/footer';
import { AuctionItemPage } from './auction-item-page/auction-item-page';
import { Add } from './menu-item/add/add';
import { Edit } from './menu-item/edit/edit';
import { View } from './menu-item/view/view';
import { NotFound } from './not-found/not-found';
import { ProfileMenu } from './menu-item/profile-menu/profile-menu';
import { NotificationBell } from './menu-item/notification-bell/notification-bell';
import { AdminPage } from './admin-page/admin-page/admin-page';
import { UserPage } from './user-page/user-page';
import { SearchPage } from './search-page/search-page';
import { ShareListingButton } from './shared/share-listing-button/share-listing-button';
import { AuctionDetail } from './auctions-page/auction-detail/auction-detail';

// Servicii și Traduceri
import { AuthInterceptor } from './services/auth-interceptor';
import { provideTranslateService, TranslatePipe } from '@ngx-translate/core'; // Importăm TranslatePipe
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { ResetPasswordPage } from './menu-item/reset-password-page/reset-password-page';
import { ForgotPasswordPage } from './menu-item/forgot-password-page/forgot-password-page';

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
    SearchPage,
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
    Footer,
    NotFound,
    ProfileMenu,
    NotificationBell,
    AdminPage,
    UserPage,
    ResetPasswordPage,
    ForgotPasswordPage,
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
    MatSelectModule,
    MatMenuModule,
    MatBadgeModule,
    TranslatePipe, // <--- Folosim Pipe-ul direct în imports
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
    }),
  ],
  bootstrap: [App],
})
export class AppModule {}
