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
import { AuctionItemPage } from './auction-item-page/auction-item-page';
import { AddItemPage } from './add-item-page/add-item-page';
import { Add } from './menu-item/add/add';
import { Edit } from './menu-item/edit/edit';
import { View } from './menu-item/view/view';
import { ForumPostDetails } from './forum-page/forum-post-details/forum-post-details';
import { CreateForumPost } from './forum-page/create-forum-post/create-forum-post';
import { NotFound } from './not-found/not-found';
import { AdminGuard } from './services/admin-guard';
import { AdminPage } from './admin-page/admin-page/admin-page';

const routes: Routes = [
  { path: '', redirectTo: '/register-page', pathMatch: 'full' },
  { path: 'home-page', component: HomePage },
  { path: 'login-page', component: LoginPage },
  { path: 'register-page', component: RegisterPage },
  { path: 'auctions', component: AuctionsPage },
  { path: 'auctions/:id', component: AuctionDetail },
  { path: 'contact-page', component: ContactPage },
  { path: 'forum-page', component: ForumPage },
  { path: 'forum/new', component: CreateForumPost },
  { path: 'forum/:id', component: ForumPostDetails },
  { path: 'profile-page', component: ProfilePage },
  { path: 'help-page', component: HelpPageComponent },
  { path: 'add-item', component: AddItemPage },
  { path: 'add', component: Add },
  { path: 'edit', component: Edit },
  { path: 'view', component: View },
  { path: 'action-item-page', component: AuctionItemPage },
  { path: 'review-page', component: ReviewComponent },
  { path: 'admin', component: AdminPage, canActivate: [AdminGuard] },
  { path: '**', component: NotFound },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
