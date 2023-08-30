import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  public isLightTheme: boolean = false;

  public onThemeSwitch(): void {
    this.isLightTheme = !this.isLightTheme;

    document.body.setAttribute('data-bs-theme', this.isLightTheme ? 'light' : 'dark');
  }
}
