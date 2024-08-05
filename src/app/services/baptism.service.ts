import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Baptism } from '../interfaces/baptism.interface';

@Injectable({
  providedIn: 'root',
})
export class BaptismService {
  private apiUrl = 'http://localhost:8080/api/baptism';

  constructor(private http: HttpClient) {}

  // Obtener todos los bautismos
  getAllBaptisms(): Observable<Baptism[]> {
    return this.http
      .get<Baptism[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  // Obtener bautismos con estado de solicitud P
  getPendingBaptisms(): Observable<Baptism[]> {
    return this.http
      .get<Baptism[]>(`${this.apiUrl}?requestStatus=P`)
      .pipe(catchError(this.handleError));
  }

  // Obtener bautismos con estado de solicitud A
  getAcceptedBaptisms(): Observable<Baptism[]> {
    return this.http
      .get<Baptism[]>(`${this.apiUrl}?requestStatus=A`)
      .pipe(catchError(this.handleError));
  }

  // Obtener bautismos con estado de solicitud R
  getRejectedBaptisms(): Observable<Baptism[]> {
    return this.http
      .get<Baptism[]>(`${this.apiUrl}?requestStatus=R`)
      .pipe(catchError(this.handleError));
  }

  // Crear un nuevo bautismo
  createBaptism(baptism: Baptism): Observable<Baptism> {
    return this.http
      .post<Baptism>(`${this.apiUrl}/create`, baptism)
      .pipe(catchError(this.handleError));
  }

  // Actualizar un bautismo
  updateBaptism(baptism: Baptism): Observable<Baptism> {
    return this.http
      .patch<Baptism>(`${this.apiUrl}/update/${baptism.idBaptism}`, baptism)
      .pipe(catchError(this.handleError));
  }

  // Actualizar el campo requestStatus de un bautismo
  updateRequestStatus(
    idBaptism: string,
    requestStatus: string
  ): Observable<Baptism> {
    return this.http
      .patch<Baptism>(`${this.apiUrl}/update/${idBaptism}`, { requestStatus })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('Error:', error);
    return throwError('Ocurrió un error. Por favor, inténtelo de nuevo.');
  }
}
