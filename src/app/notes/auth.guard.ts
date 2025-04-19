import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UseracessService } from '../useracess.service';


export const AuthGuard: CanActivateFn = () => {
  const userService = inject(UseracessService);
  const router = inject(Router);

  console.log('AuthGuard: Checking authentication'); // Debug
  if (userService.isAuthenticated()) {
    console.log('AuthGuard: User authenticated, allowing access');
    return true;
  }

  console.log('AuthGuard: User not authenticated, redirecting to /login');
  return router.createUrlTree(['/login']);
};
