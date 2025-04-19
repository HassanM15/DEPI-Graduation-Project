import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Observable, map } from 'rxjs';

import { NavbarComponent } from '../navbar/navbar.component';
import { UseracessService } from '../useracess.service';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [NavbarComponent, CommonModule, RouterLink, RouterOutlet],
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
})
export class NotesComponent implements OnInit {
  /** live list for the template */
  notes$!: Observable<any[]>;

  constructor(private notesService: UseracessService) {}

  ngOnInit(): void {
    /* first load from API */
    this.notesService.refreshNotes();

    /* subscribe to cache for live updates */
    this.notes$ = this.notesService.notes$.pipe(
      map((notes) =>
        notes.map((note) => ({
          ...note,
          tagsFormatted: this.formatTags(note.tags),
        }))
      )
    );
  }

  /* ───────────────────────── UI helpers ───────────────────────── */

  deleteNote(id: string): void {
    if (confirm('Are you sure you want to delete this note?')) {
      this.notesService.deleteNote(id).subscribe({
        error: (err) => alert(err.error?.message || 'Failed to delete note'),
      });
    }
  }

  debugEdit(id: string): void {
    console.log('Edit button clicked for note ID:', id);
  }

  formatTags(tags: any): string {
    return Array.isArray(tags) ? tags.join(', ') : tags || '';
  }
}
