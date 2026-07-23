import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { provideTranslateService, TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

// Material Design Imports
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AppRoutingModule } from './app-routing-module';
import { MatSelectModule } from '@angular/material/select';

// Pages / feature components
import { App } from './app';
import { HomePage } from './home-page/home-page';
import { ProfilePage } from './menu-item/profile-page/profile-page';
import { RegisterPage } from './menu-item/register-page/register-page';
import { LoginPage } from './menu-item/login-page/login-page';
import { ContactPage } from './menu-item/contact-page/contact-page';
import { ForumPage } from './forum-page/forum-page';
import { AuctionsPage } from './auctions-page/auctions-page';
import { SearchPage } from './search-page/search-page';
import { AddItemPage } from './add-item-page/add-item-page';
import { AuctionItemPage } from './auction-item-page/auction-item-page';
import { AuctionDetail } from './auctions-page/auction-detail/auction-detail';
import { ForumPostDetails } from './forum-page/forum-post-details/forum-post-details';
import { CreateForumPost } from './forum-page/create-forum-post/create-forum-post';
import { Footer } from './app-logic/footer/footer';
import { HelpPageComponent } from './menu-item/help-page/help-page';
import { NotificationBell } from './menu-item/notification-bell/notification-bell';
import { ProfileMenu } from './menu-item/profile-menu/profile-menu';
import { AdminPage } from './admin-page/admin-page/admin-page';
import { UserPage } from './user-page/user-page';
import { NotFound } from './not-found/not-found';

// Components
import { ShareListingButton } from './shared/share-listing-button/share-listing-button';

// Standalone Components
import { ReviewComponent } from './Models/review/review';
import { AiWidgetComponent } from './ai-widget/ai-widget';

// Servicii / Interceptoare
import { AuthInterceptor } from './services/auth-interceptor';
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
    AuctionDetail,
    ShareListingButton,
    ForumPostDetails,
    CreateForumPost,
    Footer,
    NotificationBell,
    ProfileMenu,
    AdminPage,
    UserPage,
    NotFound,
    ResetPasswordPage,
    ForgotPasswordPage,
  ],
  imports: [
  BrowserModule,
  BrowserAnimationsModule,
  AppRoutingModule,
  FormsModule,
  CommonModule,
  ReactiveFormsModule,

  MatFormFieldModule,
  MatButtonModule,
  MatCardModule,
  MatIconModule,
  MatInputModule,
  MatMenuModule,
  MatBadgeModule,
  MatSlideToggleModule,
  MatSelectModule,
  HelpPageComponent,
  ReviewComponent,
  AiWidgetComponent,


  TranslatePipe,
  TranslateDirective,
],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptorsFromDi()),
    DatePipe,
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
