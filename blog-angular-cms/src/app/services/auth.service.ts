import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AppwriteService } from './appwrite.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isLoggedInGuard: boolean = false;
  private localStorageSubject = new Subject<String>();

  constructor(
    private appwrite: AppwriteService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  public login(email: string, password: string) {
    this.appwrite.login(email, password)
      .then(() => {
        this.loadAccountDataToLocalStorage();
        this.toastr.success("Login Succesfully!");
        this.setIsLoggedIn(true);
        this.router.navigate(['/']);
      }).catch(() => {
        this.toastr.warning("Login error! Given credentials are incorrect");
      });
  }

  public logout() {
    this.appwrite.logOut().then(() => {
      this.removeAccountDataFromLocalStorage();
      this.toastr.success('Log out succesfully!')
      this.setIsLoggedIn(false);
      this.router.navigate(['/login']);
    }).catch(() => {
      this.toastr.error('Something went wrong!')
    })
  }

  public getAccount() {
    return this.appwrite.getAccount();
  }

  public isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable()
  }

  public setIsLoggedIn(value: boolean): void {
    this.loggedIn.next(value);
    this.isLoggedInGuard = value;
  }

  watchLocalStorage(): Observable<String> {
    return this.localStorageSubject.asObservable();
  }

  private loadAccountDataToLocalStorage() {
    this.appwrite.getAccount().then(result => {
      localStorage.setItem("user", JSON.stringify(result));
      this.localStorageSubject.next('changed');
    })
  }

  private removeAccountDataFromLocalStorage() {
    localStorage.removeItem("user");
    this.localStorageSubject.next('changed');
  }

}
