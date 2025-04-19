import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UseracessService } from '../useracess.service';


export const guestGuard: CanActivateFn = (route, state) => {
  const userService = inject(UseracessService);
  const router = inject(Router);

  console.log('GuestGuard: Checking authentication'); // Debug
  if (!userService.isAuthenticated()) {
    console.log(
      'GuestGuard: User not authenticated, allowing access to /login'
    );
    return true;
  }

  console.log('GuestGuard: User authenticated, redirecting to /home');
  return router.createUrlTree(['/home']);
};
