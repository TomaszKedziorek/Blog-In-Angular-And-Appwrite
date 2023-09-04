import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import {  ToastrService } from 'ngx-toastr';


export const authGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  if (auth.isLoggedInGuard) {
    auth.setIsLoggedIn(true);
    return true;
  }
  else {
    if (await auth.getAccount().catch(() => { })) {
      auth.setIsLoggedIn(true);
      return true;
    } else {
      router.navigate(['/login']);
      toastr.warning('Access denied. Pleas sign in first.')
      return false;
    }
  }
};
