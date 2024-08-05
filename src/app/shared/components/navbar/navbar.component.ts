import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  @Output() toggleSidebarEvent = new EventEmitter<void>();
  showProfileModal = false;
  userName: string | null = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getUserName().subscribe((name) => {
      this.userName = name;
    });
  }

  toggleSidebar() {
    this.toggleSidebarEvent.emit();
  }

  toggleProfileModal() {
    this.showProfileModal = !this.showProfileModal;
  }

  logout() {
    this.authService.logout();
    this.showProfileModal = false;
  }
}
