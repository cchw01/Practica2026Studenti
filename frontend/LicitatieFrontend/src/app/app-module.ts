import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { HomePage } from './home-page/home-page';
import { ProfilePage } from './profile/profile-page/profile-page';
import { RegisterPage } from './menu-item/register-page/register-page';
import { LoginPage } from './menu-item/login-page/login-page';
import { ContactPage } from './menu-item/contact-page/contact-page';
import { ForumPage } from './forum-page/forum-page';
//import { Add } from './menu-item/add/add';
import { AuctionsPage } from './auctions-page/auctions-page';
import { ReviewComponent } from './Models/review/review';
import { AuctionDetail } from './auctions-page/auction-detail/auction-detail';
import { ShareListingButton } from './shared/share-listing-button/share-listing-button';
import { AuthInterceptor } from './services/auth-interceptor';
import { AddItem } from './add-item/add-item';
//am scos Add din declarations
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
    AddItem,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HttpClientModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
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
