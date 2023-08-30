import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';

export const loginGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (await auth.getAccount().catch(() => { })) {
    router.navigate(['/']);
    return false;
  }
  else {
    return true;
  }
};
