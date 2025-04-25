import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Observable, map } from 'rxjs';
import { UseracessService } from '../useracess.service';
import { NavbarComponent } from '../navbar/navbar.component';


@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet , NavbarComponent ],
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
})
export class NotesComponent implements OnInit {
  notes$!: Observable<any[]>;
  deleteNoteId: string | null = null;
  showDeleteModal: boolean = false;

  constructor(private notesService: UseracessService) {}

  ngOnInit(): void {
    this.notesService.refreshNotes();
    this.notes$ = this.notesService.notes$.pipe(
      map((notes) =>
        notes.map((note) => ({
          ...note,
          tagsFormatted: this.formatTags(note.tags),
        }))
      )
    );
  }

  deleteNote(id: string | null): void {
    if (!id) return;
    this.notesService.deleteNote(id).subscribe({
      next: () => {
        this.showDeleteModal = false;
        this.deleteNoteId = null;
      },
      error: (err) => alert(err.error?.message || 'Failed to delete note'),
    });
  }

  confirmDelete(id: string): void {
    this.deleteNoteId = id;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.deleteNoteId = null;
    this.showDeleteModal = false;
  }

  formatTags(tags: any): string {
    return Array.isArray(tags) ? tags.join(', ') : tags || '';
  }
};