import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfilePage } from './menu-item/profile-page/profile-page';
import { RegisterPage } from './menu-item/register-page/register-page';
import { LoginPage } from './menu-item/login-page/login-page';
import { HomePage } from './home-page/home-page';
import { AuctionsPage } from './auctions-page/auctions-page';
import { AuctionDetail } from './auctions-page/auction-detail/auction-detail';
import { ContactPage } from './menu-item/contact-page/contact-page';
import { ForumPage } from './forum-page/forum-page';
import { HelpPageComponent } from './menu-item/help-page/help-page';
import { ReviewComponent } from './Models/review/review';
import { AddItem } from './add-item/add-item';

const routes: Routes = [
  { path: '', redirectTo: '/register-page', pathMatch: 'full' },
  { path: 'home-page', component: HomePage },
  { path: 'login-page', component: LoginPage },
  { path: 'register-page', component: RegisterPage },
  { path: 'auctions', component: AuctionsPage },
  { path: 'auctions/:id', component: AuctionDetail },
  { path: 'contact-page', component: ContactPage },
  { path: 'forum-page', component: ForumPage },
  { path: 'profile-page', component: ProfilePage },
  { path: 'review-page', component: ReviewComponent },
  { path: 'help-page', component: HelpPageComponent },
  { path: 'add-item', component: AddItem },
  { path: '**', redirectTo: '/home-page' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
