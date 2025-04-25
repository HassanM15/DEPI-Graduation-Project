import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UseracessService } from '../../useracess.service';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-create',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NavbarComponent],
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent {
  noteForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private notesService: UseracessService,
    private router: Router
  ) {
    this.noteForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      category: ['', Validators.required],
      priority: ['', Validators.required],
      tags: ['', Validators.required],
    });
  }

  // create.component.ts  (only onSubmit changed)
  onSubmit(): void {
    if (this.noteForm.invalid) return;

    const payload = {
      ...this.noteForm.value,
      tags: this.noteForm.value.tags
        .split(',')
        .map((t: string) => t.trim())
        .filter(Boolean),
    };

    this.notesService.createNote(payload).subscribe({
      next: () => {
        /** NEW → update the cache immediately */
        this.notesService.refreshNotes();

        /** then go back to the list */
        this.router.navigate(['/notes']);
      },
      error: (err) =>
        alert(err.error?.message ?? 'Failed to create note, try again.'),
    });
  }
}
