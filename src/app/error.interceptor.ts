import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UseracessService } from './useracess.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const AcessService = inject(UseracessService);

  return next(req).pipe(
    catchError((err) => {
      if (err.status === 401 || err.status === 403) {
        alert('Session expired or unauthorized. Please login again.');
        AcessService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};
