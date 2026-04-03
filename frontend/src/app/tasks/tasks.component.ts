import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../services/auth.service';
import { MessageService } from '../services/message.service';
import { TaskDto, TaskService } from '../services/task.service';

type TaskFilter = 'all' | 'active' | 'completed';
type TaskSort = 'updated' | 'created' | 'due' | 'title' | 'completed';

@Component({
  selector: 'app-tasks',
  imports: [FormsModule, DatePipe],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css',
})
export class TasksComponent implements OnInit {
  private readonly tasksApi = inject(TaskService);
  readonly auth = inject(AuthService);
  private readonly messages = inject(MessageService);

  readonly tasks = signal<TaskDto[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);

  filter = signal<TaskFilter>('all');
  sortBy = signal<TaskSort>('updated');
  search = signal('');

  readonly selectedId = signal<string | null>(null);

  formTitle = '';
  formDescription = '';
  formDue = '';
  formCompleted = false;

  readonly displayedTasks = computed(() => {
    let list = [...this.tasks()];
    const q = this.search().trim().toLowerCase();
    if (q) list = list.filter((t) => t.title.toLowerCase().includes(q));

    const f = this.filter();
    if (f === 'active') list = list.filter((t) => !t.isCompleted);
    else if (f === 'completed') list = list.filter((t) => t.isCompleted);

    const s = this.sortBy();
    list.sort((a, b) => {
      switch (s) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'completed':
          return Number(a.isCompleted) - Number(b.isCompleted);
        case 'due': {
          const ad = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
          const bd = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
          return ad - bd;
        }
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updated':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return list;
  });

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.tasksApi.getAll().subscribe({
      next: (items) => {
        this.tasks.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  selectTask(t: TaskDto): void {
    this.selectedId.set(t.id);
    this.formTitle = t.title;
    this.formDescription = t.description ?? '';
    this.formDue = t.dueDate ? t.dueDate.slice(0, 10) : '';
    this.formCompleted = t.isCompleted;
  }

  newTask(): void {
    this.selectedId.set(null);
    this.formTitle = '';
    this.formDescription = '';
    this.formDue = '';
    this.formCompleted = false;
  }

  save(): void {
    const title = this.formTitle.trim();
    if (!title) {
      this.messages.show('error', 'Title is required.');
      return;
    }
    const due = this.formDue ? new Date(this.formDue).toISOString() : null;
    const id = this.selectedId();
    this.saving.set(true);
    if (id) {
      this.tasksApi
        .update(id, {
          title,
          description: this.formDescription.trim() || null,
          isCompleted: this.formCompleted,
          dueDate: due,
        })
        .subscribe({
          next: () => {
            this.saving.set(false);
            this.messages.show('success', 'Task updated.');
            this.reload();
          },
          error: () => this.saving.set(false),
        });
      return;
    }

    this.tasksApi
      .create({
        title,
        description: this.formDescription.trim() || null,
        dueDate: due,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.messages.show('success', 'Task created.');
          this.newTask();
          this.reload();
        },
        error: () => this.saving.set(false),
      });
  }

  deleteSelected(): void {
    const id = this.selectedId();
    if (!id) return;
    this.tasksApi.delete(id).subscribe({
      next: () => {
        this.messages.show('success', 'Task deleted.');
        this.newTask();
        this.reload();
      },
    });
  }

  toggleRow(t: TaskDto, ev: Event): void {
    ev.stopPropagation();
    this.tasksApi
      .update(t.id, {
        title: t.title,
        description: t.description,
        isCompleted: !t.isCompleted,
        dueDate: t.dueDate,
      })
      .subscribe({
        next: () => {
          this.messages.show('success', t.isCompleted ? 'Task reopened.' : 'Task completed.');
          this.reload();
        },
      });
  }

  setFilter(f: TaskFilter): void {
    this.filter.set(f);
  }

  setSort(s: string): void {
    this.sortBy.set(s as TaskSort);
  }

  onSearchInput(value: string): void {
    this.search.set(value);
  }
}
