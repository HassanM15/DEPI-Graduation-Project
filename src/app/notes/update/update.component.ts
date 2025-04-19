import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
import { UseracessService } from '../../useracess.service';
UseracessService

@Component({
  selector: 'app-update',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './update.component.html',
  styleUrl: './update.component.scss',
})
export class UpdateComponent implements OnInit {
  noteForm: FormGroup;
  noteId: string | null = null;
  errorMessage: string | null = null;
  constructor(
    private fb: FormBuilder,
    private notesService: UseracessService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.noteForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      category: ['', Validators.required],
      priority: ['', Validators.required],
      tags: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.noteId = this.route.snapshot.paramMap.get('id');
    console.log('UpdateNoteComponent: noteId:', this.noteId); // Debug noteId
    if (this.noteId) {
      this.notesService.getNote(this.noteId).subscribe({
        next: (note) => {
          console.log('Fetched note:', note); // Debug note data
          const userEmail = this.notesService.getUserEmail();
          console.log('User email:', userEmail, 'Note email:', note.email); // Debug ownership
          if (note.email !== userEmail) {
            console.warn('Permission denied for note:', this.noteId); // Debug permission
            alert('You don’t have permission to edit this note');
            this.router.navigate(['/notes']);
            return;
          }
          this.noteForm.patchValue({
            title: note.title,
            content: note.content,
            category: note.category,
            priority: note.priority,
            tags: note.tags instanceof Array ? note.tags.join(', ') : note.tags,
          });
        },
        error: (err) => {
          console.error('Get note error:', err); // Debug error
          alert(
            err.error.message || 'Note not found or you don’t have permission'
          );
          this.router.navigate(['/notes']);
        },
      });
    } else {
      console.error('Invalid note ID'); // Debug invalid ID
      alert('Invalid note ID');
      this.router.navigate(['/notes']);
    }
  }

  onSubmit() {
    if (this.noteForm.valid && this.noteId) {
      const noteData = {
        title: this.noteForm.value.title,
        content: this.noteForm.value.content,
        category: this.noteForm.value.category,
        priority: this.noteForm.value.priority,
        tags: this.noteForm.value.tags
          .split(',')
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag),
      };
      console.log('Submitting note data:', noteData); // Debug payload
      this.notesService.updateNote(this.noteId, noteData).subscribe({
        next: (response) => {
          console.log('Note updated successfully:', this.noteId, response); // Debug success
          this.router.navigate([`/notes/show/${this.noteId}`]);
        },
        error: (err) => {
          console.error('Update note error:', err); // Debug error
          this.errorMessage = err.error?.message || 'Failed to update note';
          if (err.status === 401) {
            this.errorMessage = 'Unauthorized: Please log in again';
          } else if (err.status === 403) {
            this.errorMessage = 'You don’t have permission to update this note';
          } else if (err.status === 404) {
            this.errorMessage = 'Note not found';
          }
          alert(this.errorMessage);
        },
      });
    } else {
      console.warn(
        'Form invalid or noteId missing:',
        this.noteForm.value,
        this.noteId
      ); // Debug form
      this.errorMessage = 'Please fill all required fields correctly';
      alert(this.errorMessage);
    }
  }
}
