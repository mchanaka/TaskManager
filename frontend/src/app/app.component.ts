import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { MessageService } from './services/message.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  readonly messages = inject(MessageService);
}
