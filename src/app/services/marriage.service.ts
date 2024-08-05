import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Marriage } from '../interfaces/marriage.interface';

@Injectable({
  providedIn: 'root',
})
export class MarriageService {
  private apiUrl = 'http://localhost:8080/api/marriages';

  constructor(private http: HttpClient) {}

  // Obtener todas los matrimonios
  getAllMarriages(): Observable<Marriage[]> {
    return this.http
      .get<Marriage[]>(`${this.apiUrl}/total/admin`)
      .pipe(catchError(this.handleError));
  }

  // Obtener matrimonios con estado de solicitud P
  getPendingMarriages(): Observable<Marriage[]> {
    return this.http
      .get<Marriage[]>(`${this.apiUrl}/pending/admin`)
      .pipe(catchError(this.handleError));
  }

  // Obtener matrimonios con estado de solicitud A
  getAcceptedMarriages(): Observable<Marriage[]> {
    return this.http
      .get<Marriage[]>(`${this.apiUrl}/approved/admin`)
      .pipe(catchError(this.handleError));
  }

  // Obtener matrimonios con estado de solicitud R
  getRejectedMarriages(): Observable<Marriage[]> {
    return this.http
      .get<Marriage[]>(`${this.apiUrl}/rejected/admin`)
      .pipe(catchError(this.handleError));
  }

  // Crear un nuevo matrimonio
  createMarriage(marriage: Marriage): Observable<Marriage> {
    return this.http
      .post<Marriage>(`${this.apiUrl}/user`, marriage)
      .pipe(catchError(this.handleError));
  }

  // Actualizar un matrimonio
  updateMarriage(marriage: Marriage): Observable<Marriage> {
    return this.http
      .put<Marriage>(`${this.apiUrl}/${marriage.id}`, marriage)
      .pipe(catchError(this.handleError));
  }

  // Actualizar el campo state de un matrimonio
  updateRequestStatus(id: string, state: string): Observable<Marriage> {
    return this.http
      .patch<Marriage>(`${this.apiUrl}/admin/${id}`, { state })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('Error:', error);
    return throwError('Ocurrió un error. Por favor, inténtelo de nuevo.');
  }
}
