import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Confirmation } from '../interfaces/confirmation.interface';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationService {
  private apiUrl = 'http://localhost:8080/api/confirmation';

  constructor(private http: HttpClient) {}

  // Obtener todos los confirmaciónes
  getAllConfirmations(): Observable<Confirmation[]> {
    return this.http
      .get<Confirmation[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  // Obtener confirmaciónes con estado de solicitud P
  getPendingConfirmations(): Observable<Confirmation[]> {
    return this.http
      .get<Confirmation[]>(`${this.apiUrl}?requestStatus=P`)
      .pipe(catchError(this.handleError));
  }

  // Obtener confirmaciónes con estado de solicitud A
  getAcceptedConfirmations(): Observable<Confirmation[]> {
    return this.http
      .get<Confirmation[]>(`${this.apiUrl}?requestStatus=A`)
      .pipe(catchError(this.handleError));
  }

  // Obtener confirmaciónes con estado de solicitud R
  getRejectedConfirmations(): Observable<Confirmation[]> {
    return this.http
      .get<Confirmation[]>(`${this.apiUrl}?requestStatus=R`)
      .pipe(catchError(this.handleError));
  }

  // Crear un nuevo confirmación
  createConfirmation(confirmation: Confirmation): Observable<Confirmation> {
    return this.http
      .post<Confirmation>(`${this.apiUrl}/create`, confirmation)
      .pipe(catchError(this.handleError));
  }

  // Actualizar un confirmación
  updateConfirmation(confirmation: Confirmation): Observable<Confirmation> {
    return this.http
      .patch<Confirmation>(
        `${this.apiUrl}/update/${confirmation.id}`,
        confirmation
      )
      .pipe(catchError(this.handleError));
  }

  // Actualizar el campo requestStatus de un confirmación
  updateRequestStatus(
    id: string,
    requestStatus: string
  ): Observable<Confirmation> {
    return this.http
      .patch<Confirmation>(`${this.apiUrl}/update/${id}`, { requestStatus })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('Error:', error);
    return throwError('Ocurrió un error. Por favor, inténtelo de nuevo.');
  }
}
