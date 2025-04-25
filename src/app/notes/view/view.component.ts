import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { UseracessService } from '../../useracess.service';
import { NavbarComponent } from '../../navbar/navbar.component';
import { NgIf } from '@angular/common'; 

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, NgIf], 
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
})
export class ViewComponent implements OnInit {
  note: any = null;
  loading = false;
  errorMessage: string | null = null;
  debugInfo: string[] = [];

  showDeleteModal: boolean = false; 
  deleteNoteId: string | null = null; 

  constructor(
    private notesService: UseracessService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loading = true;
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const noteId = params.get('id');
          if (!noteId) {
            this.errorMessage = 'Invalid note ID';
            this.loading = false;
            return of(null);
          }
          return this.notesService.getNote(noteId).pipe(
            catchError((err) => {
              this.errorMessage = this.getErrorMessage(err);
              this.loading = false;
              return of(null);
            })
          );
        })
      )
      .subscribe((note) => {
        this.loading = false;
        if (note) {
          this.note = note;
        } else if (!this.errorMessage) {
          this.errorMessage = 'Note not found';
        }
      });
  }

  private getErrorMessage(err: any): string {
    if (err.status === 401) return 'Unauthorized: Please log in again';
    if (err.status === 403) return 'Forbidden: Invalid token';
    if (err.status === 404) return 'Note not found';
    return err.error?.message || 'Failed to load note';
  }

  confirmDelete(id: string): void {
    this.deleteNoteId = id;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.deleteNoteId = null;
    this.showDeleteModal = false;
  }

  deleteNote(id: string | null): void {
    if (!id) {
      console.warn('No note ID provided for deletion');
      return;
    }
    this.notesService.deleteNote(id).subscribe({
      next: () => {
        this.showDeleteModal = false;
        this.deleteNoteId = null;
        this.router.navigate(['/notes']);
      },
      error: (err) => {
        console.error('Error deleting note:', err);
        alert(err.error?.message || 'Failed to delete note');
      },
    });
  }
}
