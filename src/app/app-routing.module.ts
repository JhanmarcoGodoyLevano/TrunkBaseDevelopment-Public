import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './user/landing-page/landing-page.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AuthGuard } from './auth/auth.guard';
import { UserBaptismCreateComponent } from './user/user-baptism/baptism-create/user-baptism-create.component';
import { UserCommunionCreateComponent } from './user/user-communion/communion-create/user-communion-create.component';
import { UserConfirmationCreateComponent } from './user/user-confirmation/confirmation-create/user-confirmation-create.component';
import { UserMarriageCreateComponent } from './user/user-marriage/marriage-create/user-marriage-create.component';
import { UserBodyComponent } from './user/user-body/user-body.component';
import { AdminBodyComponent } from './admin/admin-body/admin-body.component';
import { AdminPanelComponent } from './admin/admin-panel/admin-panel.component';
import { AdminBaptismListComponent } from './admin/admin-baptism/baptism-list/admin-baptism-list.component';
import { AdminCommunionListComponent } from './admin/admin-communion/communion-list/admin-communion-list.component';
import { AdminConfirmationListComponent } from './admin/admin-confirmation/confirmation-list/admin-confirmation-list.component';
import { AdminMarriageListComponent } from './admin/admin-marriage/marriage-list/admin-marriage-list.component';
import { AdminAccountingComponent } from './admin/admin-accounting/admin-accounting.component';
import { AdminModeratorComponent } from './admin/admin-moderator/admin-moderator.component';
import { AdminSettingsComponent } from './admin/admin-settings/admin-settings.component';

const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  // {
  //   path: 'verifyEmail',
  //   component: VerifyEmailComponent,
  // },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'bautismo/create',
    component: UserBaptismCreateComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'user' },
  },
  {
    path: 'comunion/create',
    component: UserCommunionCreateComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'user' },
  },
  {
    path: 'confirmacion/create',
    component: UserConfirmationCreateComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'user' },
  },
  {
    path: 'matrimonio/create',
    component: UserMarriageCreateComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'user' },
  },
  {
    path: 'user/panel',
    component: UserBodyComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'user' },
  },
  {
    path: 'admin',
    component: AdminBodyComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'admin' },
    children: [
      {
        path: '',
        redirectTo: 'panel',
        pathMatch: 'full',
      },
      {
        path: 'panel',
        component: AdminPanelComponent,
        canActivate: [AuthGuard],
        data: { expectedRole: 'admin' },
      },
      {
        path: 'constancia',
        children: [
          {
            path: '',
            redirectTo: 'bautismo',
            pathMatch: 'full',
          },
          {
            path: 'bautismo',
            component: AdminBaptismListComponent,
            canActivate: [AuthGuard],
            data: { expectedRole: 'admin' },
          },
          {
            path: 'comunion',
            component: AdminCommunionListComponent,
            canActivate: [AuthGuard],
            data: { expectedRole: 'admin' },
          },
          {
            path: 'confirmacion',
            component: AdminConfirmationListComponent,
            canActivate: [AuthGuard],
            data: { expectedRole: 'admin' },
          },
          {
            path: 'matrimonio',
            component: AdminMarriageListComponent,
            canActivate: [AuthGuard],
            data: { expectedRole: 'admin' },
          },
        ],
      },
      {
        path: 'contabilidad',
        component: AdminAccountingComponent,
        canActivate: [AuthGuard],
        data: { expectedRole: 'admin' },
      },
      {
        path: 'moderador',
        component: AdminModeratorComponent,
        canActivate: [AuthGuard],
        data: { expectedRole: 'admin' },
      },
      {
        path: 'configuracion',
        component: AdminSettingsComponent,
        canActivate: [AuthGuard],
        data: { expectedRole: 'admin' },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
