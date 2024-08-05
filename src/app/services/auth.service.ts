import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { User } from '../interfaces/user.interface';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = "https://vg-ms-user-production.up.railway.app/api/users";
  user$: Observable<User | null>;

  constructor(private afAuth: AngularFireAuth, private http: HttpClient, private router: Router) {
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.getUserByUid(user.uid);
        } else {
          return of(null);
        }
      })
    );
  }

  async register(firstName: string, lastName: string, email: string, password: string, role: string , phoneNumber: string) {
    const userPayload = { firstName, lastName, email, password, role , phoneNumber };
  
    await this.http.post(`${this.apiUrl}/register`, userPayload).toPromise();
  }
  
  async login(email: string, password: string) {
    try {
      await this.afAuth.signInWithEmailAndPassword(email, password);
      const user = await this.afAuth.currentUser;
      if (user) {
        const userDoc = await this.getUserByUid(user.uid).toPromise();
        
        if (userDoc) {
          switch (userDoc.role) {
            case 'admin':
              this.router.navigateByUrl('/admin/panel');
              break;
            case 'user':
              this.router.navigateByUrl('/user/panel');
              break;
            default:
              this.router.navigate(['/']);
              break;
          }
        }
      }
    } catch (error) {
      console.error('Login failed', error);
    }
  }

  getUserRole(): Observable<string | null> {
    return this.user$.pipe(
      map(user => (user ? user.role : null))
    );
  }

  getUserName(): Observable<string | null> {
    return this.user$.pipe(
      map(user => (user ? `${user.firstName} ${user.lastName}` : null))
    );
  }

  async googleSignIn() {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      const credential = await this.afAuth.signInWithPopup(provider);
      const user = credential.user;
      
      if (user) {
        this.http.get<User>(`${this.apiUrl}/uid/${user.uid}`).subscribe(userDoc => {
          if (!userDoc) {
            this.http.post(`${this.apiUrl}/register`, {
              uid: user.uid,
              email: user.email,
              role: 'user'
            }).subscribe();
          }
          this.router.navigateByUrl('/user/panel');
        });
      }
    } catch (error) {
      console.error('Google sign-in failed', error);
    }
  }

  async logout() {
    await this.afAuth.signOut();
    return this.router.navigate(['/login']);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}`);
  }

  private getUserByUid(uid: string): Observable<User | null> {
    return this.http.get<User>(`${this.apiUrl}/uid/${uid}`);
  }
}
