import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UseracessService } from '../useracess.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private AcessService: UseracessService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(18)]],
      address: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.AcessService.register(this.registerForm.value).subscribe({
        next: (response: any) => {
          this.AcessService.setTokentoLocalStorage(response.token);
          this.router.navigate(['/home']);
        },
        error: (err) => {
          alert(err.error.message || 'Registration failed');
        },
      });
    }
  }
}
