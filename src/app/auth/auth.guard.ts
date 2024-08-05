import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.authService.user$.pipe(
      take(1),
      map((user) => {
        if (!user) {
          return this.router.createUrlTree(['/login']);
        }

        const expectedRole = next.data['expectedRole'] as string;
        if (user.role === expectedRole) {
          return true;
        } else {
          if (user.role === 'admin') {
            return this.router.createUrlTree(['/admin/panel']);
          } else {
            return this.router.createUrlTree(['/']);
          }
        }
      })
    );
  }
}
