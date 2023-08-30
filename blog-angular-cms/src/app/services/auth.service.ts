import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppwriteService } from './appwrite.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isLoggedInGuard: boolean = false;

  constructor(
    private appwrite: AppwriteService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  public login(email: string, password: string) {
    this.appwrite.login(email, password)
      .then(() => {
        this.toastr.success("Login Succesfully!");
        this.loadAccountDataToLocalStorage();
        this.setIsLoggedIn(true);
        this.router.navigate(['/']);
      }).catch(() => {
        this.toastr.warning("Login error! Given credentials are incorrect");
      });
  }

  public logout() {
    this.appwrite.logOut().then(() => {
      localStorage.removeItem("user");
      this.toastr.success('Log out succesfully!')
      this.setIsLoggedIn(false);
      this.router.navigate(['/login']);
    }).catch(() => {
      this.toastr.error('Something went wrong!')
    })
  }

  public getAccount(){
    return this.appwrite.getAccount();
  }

  private loadAccountDataToLocalStorage() {
    this.appwrite.getAccount().then(result => {
      localStorage.setItem("user", JSON.stringify(result));
    })
  }

  public isLoggedIn() {
    return this.loggedIn.asObservable()
  }

  public setIsLoggedIn(value: boolean): void {
    this.loggedIn.next(value);
    this.isLoggedInGuard = value;
  }

}
