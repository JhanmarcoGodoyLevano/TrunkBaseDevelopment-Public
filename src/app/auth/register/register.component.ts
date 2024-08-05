import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  role: string = 'user';
  firstName: string = '';
  lastName: string = '';
  constructor(private authService: AuthService, private router: Router) {}

  register() {
    this.authService
      .register(
        this.firstName,
        this.lastName,
        this.email,
        this.password,
        this.role
      )
      .then(() => {
        this.router.navigate(['/']);
      })
      .catch((error) => console.error(error));
  }
}
