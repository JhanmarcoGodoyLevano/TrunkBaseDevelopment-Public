import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import firebase from 'firebase/compat/app';
import { User } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User | null>;

  constructor(private afAuth: AngularFireAuth, private firestore: AngularFirestore, private router: Router) {
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.firestore.doc<User>(`users/${user.uid}`).valueChanges().pipe(
            map(userData => userData || null)
          );
        } else {
          return of(null);
        }
      })
    );
  }

  async register(firstName: string, lastName: string, email: string, password: string, role: string ) {
    const credential = await this.afAuth.createUserWithEmailAndPassword(email, password);
      return this.firestore.doc(`users/${credential.user?.uid}`).set({
      uid: credential.user?.uid,
      lastName: lastName,
      firstName: firstName,
      email: email,
      role: role
    });
  }

  async login(email: string, password: string) {
    const credential = await this.afAuth.signInWithEmailAndPassword(email, password);
    const userDoc = await this.firestore.doc<User>(`users/${credential.user?.uid}`).get().toPromise();
    const userData = userDoc?.data() as User;

    if (userData) {
      switch (userData.role) {
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
  const credential = await this.afAuth.signInWithPopup(provider);
  const userRef = this.firestore.doc(`users/${credential.user?.uid}`);
  const userDoc = await userRef.get().toPromise();

  if (userDoc && !userDoc.exists) {
    await userRef.set({
      uid: credential.user?.uid,
      email: credential.user?.email,
      role: 'user'
    } as User);
  }

  this.router.navigateByUrl('/user/panel');
}

  async logout() {
    await this.afAuth.signOut();
    return this.router.navigate(['/login']);
  }

  sendVerificationCode(email: string, password: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const credential = await this.afAuth.createUserWithEmailAndPassword(email, password);
        await credential.user?.sendEmailVerification();
        console.log(`Código de verificación enviado a ${email}`);
        resolve();
      } catch (error) {
        console.error(`Error enviando código de verificación a ${email}`, error);
        reject(error);
      }
    });
  }

  verifyCode(email: string, code: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`Verificando código ${code} para ${email}`);
      resolve();
    });
  }


}
