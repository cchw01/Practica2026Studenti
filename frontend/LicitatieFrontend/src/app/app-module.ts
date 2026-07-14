import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { HomePage } from './home-page/home-page';
import { AppRoutingModule } from './app-routing-module';

import { App } from './app';
import { ProfilePage } from './profile/profile-page/profile-page';
import { RegisterPage } from './menu-item/register-page/register-page';
import { LoginPage } from './menu-item/login-page/login-page';
import { ContactPage } from './menu-item/contact-page/contact-page'
import { ForumPage } from './forum-page/forum-page'
//import { Add } from './menu-item/add/add';
import { AuctionsPage } from './auctions-page/auctions-page';import { AuctionItemPage } from './auction-item-page/auction-item-page';
import { Add } from './menu-item/add/add';
import { Edit } from './menu-item/edit/edit';
import { View } from './menu-item/view/view';
import { ReviewComponent } from './Models/review/review';

//am scos Add din declarations
@NgModule({
  declarations: [App, LoginPage, RegisterPage, HomePage, ProfilePage, ContactPage, ForumPage, AuctionsPage,  AuctionItemPage, Add, Edit, View],
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
  ],
  bootstrap: [App]
})
export class AppModule {}