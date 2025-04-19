import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class UseracessService {
  private readonly apiUrl = 'http://localhost:8000';
  private _notes$ = new BehaviorSubject<any[]>([]);
  notes$ = this._notes$.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  /* =============  AUTH   ============= */
  register(data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    age: number;
    address: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data).pipe(
      tap((res: any) => {
        this.setTokentoLocalStorage(res.token);
        this.refreshNotes();
      })
    );
  }

  logout(): void {
    this.removeTokenLocalStorage();
    this._notes$.next([]);
    this.router.navigate(['/login']);
  }


  refreshNotes(): void {
    this.http
      .get<any[]>(`${this.apiUrl}/notes`)
      .pipe(
        catchError((err) => {
          this._notes$.next([]);
          return throwError(() => err);
        })
      )
      .subscribe((list) => this._notes$.next(list));
  }

  createNote(data: any): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/notes`, data)
      .pipe(
        tap((created: any) =>
          this._notes$.next([...this._notes$.value, created])
        )
      );
  }

  updateNote(id: string, note: any): Observable<any> {
    return this.http
      .put(`${this.apiUrl}/notes/${id}`, note)
      .pipe(
        tap((updated: any) =>
          this._notes$.next(
            this._notes$.value.map((n) => (n.id == id ? updated : n))
          )
        )
      );
  }

  deleteNote(id: string): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}/notes/${id}`)
      .pipe(
        tap(() =>
          this._notes$.next(this._notes$.value.filter((n) => n.id != id))
        )
      );
  }

  getNote(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/notes/${id}`);
  }

  setTokentoLocalStorage(token: string): void {
    localStorage.setItem('token', token);
  }

  removeTokenLocalStorage(): void {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getUserEmail(): string {
    const token = localStorage.getItem('token');
    try {
      return token ? JSON.parse(atob(token.split('.')[1]))?.email || '' : '';
    } catch {
      return '';
    }
  }

  getNotes(): Observable<any[]> {
    
    if (this._notes$.value.length === 0) {
      this.refreshNotes();
    }
    return this.notes$; 
  }

  getAllNotes(): Observable<any[]> {
    return this.getNotes();
  }
}
