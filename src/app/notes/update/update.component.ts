import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { UseracessService } from '../../useracess.service';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NavbarComponent],
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss'],
})
export class UpdateComponent implements OnInit {
  noteForm: FormGroup;
  noteId: string | null = null;
  errorMessage: string | null = null;
  showPopup: boolean = false; 

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
    if (this.noteId) {
      this.notesService.getNote(this.noteId).subscribe({
        next: (note) => {
          const userEmail = this.notesService.getUserEmail();
          if (note.email !== userEmail) {
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
          alert(err.error.message || 'Note not found or you don’t have permission');
          this.router.navigate(['/notes']);
        },
      });
    } else {
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
  
      this.notesService.updateNote(this.noteId, noteData).subscribe({
        next: () => {
          // إظهار الرسالة المنبثقة عند النجاح
          this.showPopup = true;
          setTimeout(() => {
            this.showPopup = false;
            this.router.navigate([`/notes/show/${this.noteId}`]);
          }, 6000); // إخفاء الرسالة بعد 6 ثوانٍ
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to update note';
          alert(this.errorMessage);
        },
      });
    } else {
      this.errorMessage = 'Please fill all required fields correctly';
      alert(this.errorMessage);
    }
  }
  
  closePopup() {
    this.showPopup = false;
    this.router.navigate([`/notes/show/${this.noteId}`]); 

  }
};