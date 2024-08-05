import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Income } from '../interfaces/income.interface';

@Injectable({
  providedIn: 'root',
})
export class IncomeService {
  private apiUrl = 'https://vg-ms-income-production.up.railway.app/api/income';

  constructor(private http: HttpClient) {}

  getAllAccounting(): Observable<Income[]> {
    return this.http.get<Income[]>(this.apiUrl).pipe(catchError(this.handleError));
  }

  getAccountingById(id: string): Observable<Income> {
    return this.http.get<Income>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  createAccounting(accounting: FormData): Observable<Income> {
    return this.http.post<Income>(`${this.apiUrl}/create`, accounting).pipe(catchError(this.handleError));
  }

  updateAccounting(id: string, accounting: Income): Observable<Income> {
    return this.http.put<Income>(`${this.apiUrl}/${id}`, accounting).pipe(catchError(this.handleError));
  }

  deleteAccounting(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  inactivateAccounting(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/inactivate/${id}`).pipe(catchError(this.handleError));
  }

  activateAccounting(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/activate/${id}`, {}).pipe(catchError(this.handleError));
  }

  // Método PATCH para actualizar parcialmente un registro
  patchAccounting(id: string, partialUpdate: Partial<Income>): Observable<Income> {
    return this.http.patch<Income>(`${this.apiUrl}/update/${id}`, partialUpdate).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error:', error);
    return throwError('Ocurrió un error. Por favor, inténtelo de nuevo.');
  }
}
