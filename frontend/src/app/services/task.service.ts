import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { MessageService } from './message.service';

export interface TaskDto {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string | null;
  dueDate?: string | null;
}

export interface UpdateTaskRequest {
  title: string;
  description?: string | null;
  isCompleted: boolean;
  dueDate?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly base = `${environment.apiUrl}/api/Tasks`;

  constructor(
    private readonly http: HttpClient,
    private readonly messages: MessageService,
  ) {}

  getAll(): Observable<TaskDto[]> {
    return this.http.get<TaskDto[]>(this.base).pipe(catchError((e) => this.handle(e, 'Could not load tasks.')));
  }

  create(body: CreateTaskRequest): Observable<TaskDto> {
    return this.http.post<TaskDto>(this.base, body).pipe(catchError((e) => this.handle(e, 'Could not create task.')));
  }

  update(id: string, body: UpdateTaskRequest): Observable<TaskDto> {
    return this.http
      .put<TaskDto>(`${this.base}/${id}`, body)
      .pipe(catchError((e) => this.handle(e, 'Could not update task.')));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`).pipe(catchError((e) => this.handle(e, 'Could not delete task.')));
  }

  private handle(err: HttpErrorResponse, fallback: string): Observable<never> {
    const body = err.error as { detail?: string };
    this.messages.show('error', body?.detail ?? fallback);
    return throwError(() => err);
  }
}
