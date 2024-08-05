import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { AdminBaptismListComponent } from './admin/admin-baptism/baptism-list/admin-baptism-list.component';
import { AdminCommunionListComponent } from './admin/admin-communion/communion-list/admin-communion-list.component';
import { AdminConfirmationListComponent } from './admin/admin-confirmation/confirmation-list/admin-confirmation-list.component';
import { AdminMarriageListComponent } from './admin/admin-marriage/marriage-list/admin-marriage-list.component';
import { AdminBodyComponent } from './admin/admin-body/admin-body.component';
import { AdminPanelComponent } from './admin/admin-panel/admin-panel.component';
import { LandingPageComponent } from './user/landing-page/landing-page.component';
import { AdminModeratorComponent } from './admin/admin-moderator/admin-moderator.component';
import { AdminSettingsComponent } from './admin/admin-settings/admin-settings.component';
import { AdminAccountingComponent } from './admin/admin-accounting/admin-accounting.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { UserBaptismCreateComponent } from './user/user-baptism/baptism-create/user-baptism-create.component';
import { UserConfirmationCreateComponent } from './user/user-confirmation/confirmation-create/user-confirmation-create.component';
import { UserCommunionCreateComponent } from './user/user-communion/communion-create/user-communion-create.component';
import { UserMarriageCreateComponent } from './user/user-marriage/marriage-create/user-marriage-create.component';
import { UserPanelComponent } from './user/user-panel/user-panel.component';
import { UserBodyComponent } from './user/user-body/user-body.component';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'src/environments/environments';
import { UserIncomeComponent } from './user/user-income/user-income.component';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    AdminBaptismListComponent,
    UserBaptismCreateComponent,
    AdminCommunionListComponent,
    UserCommunionCreateComponent,
    AdminConfirmationListComponent,
    UserConfirmationCreateComponent,
    AdminMarriageListComponent,
    UserMarriageCreateComponent,
    AdminBodyComponent,
    AdminPanelComponent,
    LandingPageComponent,
    AdminModeratorComponent,
    AdminSettingsComponent,
    AdminAccountingComponent,
    LoginComponent,
    RegisterComponent,
    SidebarComponent,
    NavbarComponent,
    UserPanelComponent,
    UserBodyComponent,
    UserIncomeComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
