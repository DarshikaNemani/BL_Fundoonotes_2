import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user_service/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  hide = signal(true);
  loginForm: FormGroup;
  isLoading = signal(false);

  private emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(this.emailRegex)]],
      password: ['', Validators.required],
      service: ['advance']
    });
  }

  togglePasswordVisibility() {
    this.hide.set(!this.hide());
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);

      const payload = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
        service: this.loginForm.value.service,
      };

      this.userService.signIn(payload).subscribe({
        next: (result: any) => {
          console.log('Login successful:', result);
          this.isLoading.set(false);

          if (result.id) {
            localStorage.setItem('authToken', result.id);
            if (result) {
              localStorage.setItem('userData', JSON.stringify(result));
            } 
          }
          
          this.snackBar.open('Login successful!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          
          this.router.navigateByUrl('')
        },
        error: (err: any) => {
          console.error('Login failed:', err);
          this.isLoading.set(false);
          
          const errorMessage = err.error?.message || 'Login failed. Please check your credentials.';
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
      this.snackBar.open('Please fill all required fields correctly.', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    }
  }

  get emailError() {
    const control = this.loginForm.get('email');
    if (control?.hasError('required')) return 'Email is required';
    if (control?.hasError('pattern')) return 'Please enter a valid email address';
    return '';
  }

  get passwordError() {
    const control = this.loginForm.get('password');
    if (control?.hasError('required')) return 'Password is required';
    return '';
  }
}