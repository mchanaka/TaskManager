import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { MessageService } from '../services/message.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messages = inject(MessageService);

  mode: 'login' | 'register' = 'login';
  userName = '';
  email = '';
  password = '';
  busy = false;

  ngOnInit(): void {
    this.auth.refreshSession().subscribe((ok) => {
      if (ok) void this.router.navigateByUrl('/');
    });
  }

  setMode(m: 'login' | 'register'): void {
    this.mode = m;
  }

  submit(): void {
    if (this.busy) return;
    const u = this.userName.trim();
    const p = this.password;
    if (!u || !p) {
      this.messages.show('error', 'Please enter username and password.');
      return;
    }
    if (this.mode === 'register') {
      const e = this.email.trim();
      if (!e) {
        this.messages.show('error', 'Please enter your email.');
        return;
      }
      this.busy = true;
      this.auth.register({ userName: u, email: e, password: p }).subscribe((ok) => {
        this.busy = false;
        if (ok) {
          this.messages.show('success', 'Account created. Welcome!');
          void this.router.navigateByUrl('/');
        }
      });
      return;
    }

    this.busy = true;
    this.auth.login({ userName: u, password: p }).subscribe((ok) => {
      this.busy = false;
      if (ok) {
        this.messages.show('success', 'Signed in.');
        void this.router.navigateByUrl('/');
      }
    });
  }
}
