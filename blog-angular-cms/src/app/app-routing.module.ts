import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoriesComponent } from './categories/categories.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NewPostComponent } from './posts/new-post/new-post.component';
import { AllPostComponent } from './posts/all-post/all-post.component';
import { LoginComponent } from './auth/login/login.component';
import { authGuard } from './services/auth.guard';
import { SubscribersComponent } from './subscribers/subscribers.component';
import { loginGuard } from './services/login.guard';
import { CommentsListComponent } from './comments/comments-list/comments-list.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';

const routes: Routes = [
  { path: '', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  { path: 'categories', component: CategoriesComponent, canActivate: [authGuard] },
  { path: 'posts', component: AllPostComponent, canActivate: [authGuard] },
  { path: 'posts/new', component: NewPostComponent, canActivate: [authGuard] },
  { path: 'posts/edit/:id', component: NewPostComponent, canActivate: [authGuard] },
  { path: 'subscribers', component: SubscribersComponent, canActivate: [authGuard] },
  { path: 'comments', component: CommentsListComponent, canActivate: [authGuard] },
  { path: '**', component: PageNotFoundComponent, canActivate: [authGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
