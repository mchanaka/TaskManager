import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { MessageService } from './message.service';

export interface UserInfo {
  userName: string;
  email: string;
}

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly base = `${environment.apiUrl}/api/Auth`;
  private readonly user = signal<UserInfo | null>(null);

  readonly currentUser = this.user.asReadonly();
  readonly isAuthenticated = computed(() => this.user() !== null);

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly messages: MessageService,
  ) {}

  refreshSession(): Observable<boolean> {
    return this.http.get<UserInfo>(`${this.base}/me`).pipe(
      tap((u) => this.user.set(u)),
      map(() => true),
      catchError(() => {
        this.user.set(null);
        return of(false);
      }),
    );
  }

  login(body: LoginRequest): Observable<boolean> {
    return this.http.post<UserInfo>(`${this.base}/login`, body).pipe(
      tap((u) => this.user.set(u)),
      map(() => true),
      catchError((err: HttpErrorResponse) => {
        this.messages.show('error', this.readError(err, 'Login failed.'));
        return of(false);
      }),
    );
  }

  register(body: RegisterRequest): Observable<boolean> {
    return this.http.post<UserInfo>(`${this.base}/register`, body).pipe(
      tap((u) => this.user.set(u)),
      map(() => true),
      catchError((err: HttpErrorResponse) => {
        this.messages.show('error', this.readError(err, 'Registration failed.'));
        return of(false);
      }),
    );
  }

  logout(): void {
    this.http.post(`${this.base}/logout`, {}).subscribe({
      next: () => {
        this.user.set(null);
        void this.router.navigateByUrl('/login');
      },
      error: () => {
        this.user.set(null);
        void this.router.navigateByUrl('/login');
      },
    });
  }

  private readError(err: HttpErrorResponse, fallback: string): string {
    const body = err.error as { detail?: string; title?: string; errors?: Record<string, string[]> };
    if (body?.detail) return body.detail;
    if (body?.errors) {
      const first = Object.values(body.errors).flat()[0];
      if (first) return first;
    }
    return fallback;
  }
}
