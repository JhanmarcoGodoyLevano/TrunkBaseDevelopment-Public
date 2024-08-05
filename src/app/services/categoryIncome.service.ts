import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface IncomeCategory {
  categoryId: string;
  name: string;
  amount: number;
}

@Injectable({
  providedIn: 'root',
})
export class IncomeCategoryService {
  private apiUrl = 'https://vg-ms-income-production.up.railway.app/api/income_category';

  constructor(private http: HttpClient) {}

  getAllCategories(): Observable<IncomeCategory[]> {
    return this.http.get<IncomeCategory[]>(this.apiUrl).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error:', error);
    return throwError('Ocurrió un error al obtener las categorías. Por favor, inténtelo de nuevo.');
  }
}
