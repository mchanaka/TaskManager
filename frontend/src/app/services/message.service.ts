import { Injectable, signal } from '@angular/core';

export type MessageKind = 'success' | 'error' | 'info';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  readonly text = signal<string | null>(null);
  readonly kind = signal<MessageKind>('info');

  show(kind: MessageKind, text: string, durationMs = 5000): void {
    this.kind.set(kind);
    this.text.set(text);
    if (durationMs > 0) {
      window.setTimeout(() => this.clear(), durationMs);
    }
  }

  clear(): void {
    this.text.set(null);
  }
}
