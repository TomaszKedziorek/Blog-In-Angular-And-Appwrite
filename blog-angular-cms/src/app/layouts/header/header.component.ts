import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  public isLightTheme: boolean = false;
  public isLoggedIn$!: Observable<boolean>;
  public userEmail!: string;

  constructor(private auth: AuthService) { }

  public ngOnInit(): void {
    this.isLoggedIn$ = this.auth.isLoggedIn();
    this.showLoggedUser();
    this.auth.watchLocalStorage().subscribe(() => this.showLoggedUser());
  }

  private showLoggedUser() {
    const user: string | null = localStorage.getItem("user");
    if (user) {
      this.userEmail = JSON.parse(user).email;
    }
  }

  public onLogOut(): void {
    this.auth.logout();
  }

  public onThemeSwitch(): void {
    this.isLightTheme = !this.isLightTheme;
    document.body.setAttribute('data-bs-theme', this.isLightTheme ? 'light' : 'dark');
  }
}