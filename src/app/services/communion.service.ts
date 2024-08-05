import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Communion } from '../interfaces/communion.interface';

@Injectable({
  providedIn: 'root',
})
export class CommunionService {
  private apiUrl = 'http://localhost:8080/api/communions';

  constructor(private http: HttpClient) {}

  // Obtener todas las comuniones
  getAllCommunions(): Observable<Communion[]> {
    return this.http
      .get<Communion[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  // Obtener comuniones con estado de solicitud P
  getPendingCommunions(): Observable<Communion[]> {
    return this.http
      .get<Communion[]>(`${this.apiUrl}/pending/admin`)
      .pipe(catchError(this.handleError));
  }

  // Obtener comuniones con estado de solicitud A
  getAcceptedCommunions(): Observable<Communion[]> {
    return this.http
      .get<Communion[]>(`${this.apiUrl}/approved/admin`)
      .pipe(catchError(this.handleError));
  }

  // Obtener comuniones con estado de solicitud R
  getRejectedCommunions(): Observable<Communion[]> {
    return this.http
      .get<Communion[]>(`${this.apiUrl}/rejected/admin`)
      .pipe(catchError(this.handleError));
  }

  // Crear una nueva comunión
  createCommunion(communion: Communion): Observable<Communion> {
    return this.http
      .post<Communion>(`${this.apiUrl}/user`, communion)
      .pipe(catchError(this.handleError));
  }

  // Actualizar una comunión
  updateCommunion(communion: Communion): Observable<Communion> {
    return this.http
      .put<Communion>(`${this.apiUrl}/${communion.id}`, communion)
      .pipe(catchError(this.handleError));
  }

  // Actualizar el campo state de una comunión
  updateRequestStatus(id: string, state: string): Observable<Communion> {
    return this.http
      .patch<Communion>(`${this.apiUrl}/admin/${id}`, { state })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('Error:', error);
    return throwError('Ocurrió un error. Por favor, inténtelo de nuevo.');
  }
}
