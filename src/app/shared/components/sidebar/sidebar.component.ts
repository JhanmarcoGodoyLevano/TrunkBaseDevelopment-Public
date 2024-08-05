import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

interface MenuItem {
  name: string;
  displayName: string;
  icon: string;
  route: string;
  expectedRole: string[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  userRole: string | null = null;
  displayName: string = 'Usuario';

  constructor(private authService: AuthService) {}
  ngOnInit(): void {
    this.authService.getUserRole().subscribe((role) => {
      console.log('Rol del usuario:', role);
      this.userRole = role;
      if (this.userRole === 'admin') {
        this.displayName = 'Administrador';
      } else if (this.userRole === 'user') {
        this.displayName = 'Usuario';
      }
    });
  }

  userRoleMatchesExpectedRole(expectedRoles: string[]): boolean {
    return this.userRole !== null && expectedRoles.includes(this.userRole);
  }

  isCollapsed = false;
  selectedMenuItem: string = 'Panel';
  submenuOpen: string | null = null;

  constanciasSubmenuItems: MenuItem[] = [
    {
      name: 'Bautismo',
      displayName: 'Bautismo',
      icon: 'fas fa-child',
      route: '/admin/constancia/bautismo',
      expectedRole: ['admin'],
    },
    {
      name: 'Comunion',
      displayName: 'Comunión',
      icon: 'fas fa-chalice',
      route: '/admin/constancia/comunion',
      expectedRole: ['admin'],
    },
    {
      name: 'Confirmacion',
      displayName: 'Confirmación',
      icon: 'fas fa-cross',
      route: '/admin/constancia/confirmacion',
      expectedRole: ['admin'],
    },
    {
      name: 'Matrimonio',
      displayName: 'Matrimonio',
      icon: 'fas fa-ring',
      route: '/admin/constancia/matrimonio',
      expectedRole: ['admin'],
    },
  ];

  menuItems: MenuItem[] = [
    {
      name: 'Panel',
      displayName: 'Panel',
      icon: 'fas fa-home',
      route: '/admin/panel',
      expectedRole: ['admin'],
    },
    {
      name: 'Constancias',
      displayName: 'Constancias',
      icon: 'fas fa-file',
      route: '/admin/constancia',
      expectedRole: ['admin'],
    },
    {
      name: 'Contabilidad',
      displayName: 'Contabilidad',
      icon: 'fas fa-calculator',
      route: '/admin/contabilidad',
      expectedRole: ['admin'],
    },
    {
      name: 'Moderador',
      displayName: 'Usuarios',
      icon: 'fas fa-user-tie',
      route: '/admin/moderador',
      expectedRole: ['admin', 'moderador'],
    },
    {
      name: 'Configuración',
      displayName: 'Configuración',
      icon: 'fas fa-cog',
      route: '/admin/configuracion',
      expectedRole: ['admin'],
    },
  ];

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed) {
      this.closeSubmenu();
    }
  }

  selectMenuItem(itemName: string) {
    this.selectedMenuItem = itemName;
    if (!this.constanciasSubmenuItems.some((item) => item.name === itemName)) {
      this.closeSubmenu();
    }
  }

  toggleSubmenu(submenuName: string) {
    if (this.submenuOpen === submenuName) {
      this.submenuOpen = null;
    } else {
      this.submenuOpen = submenuName;
    }
  }

  closeSubmenu() {
    this.submenuOpen = null;
  }

  hasUserRole(): boolean {
    return !!this.userRole;
  }
}
