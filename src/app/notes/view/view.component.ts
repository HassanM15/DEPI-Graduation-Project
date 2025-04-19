import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { UseracessService } from '../../useracess.service';

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
})
export class ViewComponent implements OnInit {
  note: any = null;
  loading = false;
  errorMessage: string | null = null;
  debugInfo: string[] = [];

  constructor(
    private notesService: UseracessService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const startTime = Date.now(); // Debug
    this.loading = true;
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const noteId = params.get('id');
          this.debugInfo.push(`Route ID: ${noteId}`);
          if (!noteId) {
            console.warn('Invalid note ID'); // Debug
            this.errorMessage = 'Invalid note ID';
            this.loading = false;
            return of(null);
          }
          const token = localStorage.getItem('token');
          this.debugInfo.push(`Token: ${token ? 'Present' : 'Missing'}`);
          console.log(`Fetching note ID: ${noteId}`); // Debug
          return this.notesService.getNote(noteId).pipe(
            catchError((err) => {
              console.error('Get note error:', JSON.stringify(err, null, 2)); // Debug
              this.debugInfo.push(
                `Error: ${err.status} ${err.error?.message || 'Unknown error'}`
              );
              this.errorMessage = this.getErrorMessage(err);
              this.loading = false;
              // Fallback: Fetch all notes to check if ID exists
              return this.notesService.getAllNotes().pipe(
                switchMap((notes) => {
                  const foundNote = notes.find((n:any) => n.id === noteId);
                  this.debugInfo.push(
                    `Note ${noteId} in all notes: ${
                      foundNote ? 'Found' : 'Not found'
                    }`
                  );
                  if (foundNote) {
                    this.debugInfo.push(
                      `Note email: ${
                        foundNote.email
                      }, User email: ${this.notesService.getUserEmail()}`
                    );
                  }
                  return of(null);
                }),
                catchError((fallbackErr) => {
                  console.error(
                    'Get all notes error:',
                    JSON.stringify(fallbackErr, null, 2)
                  ); // Debug
                  this.debugInfo.push(
                    `Fallback error: ${fallbackErr.status} ${
                      fallbackErr.error?.message || 'Unknown error'
                    }`
                  );
                  return of(null);
                })
              );
            })
          );
        })
      )
      .subscribe((note) => {
        this.loading = false;
        if (note) {
          const userEmail = this.notesService.getUserEmail();
          this.debugInfo.push(
            `User email: ${userEmail}, Note email: ${note.email}`
          );
          if (note.email !== userEmail) {
            console.warn('Permission denied for note:', note.id); // Debug
            this.errorMessage = 'You don’t have permission to view this note';
            this.router.navigate(['/notes']);
            return;
          }
          this.note = {
            ...note,
            tagsFormatted: this.formatTags(note.tags),
          };
          console.log(
            `Note loaded in ${Date.now() - startTime}ms:`,
            JSON.stringify(this.note, null, 2)
          ); // Debug
          this.debugInfo.push(`Note loaded in ${Date.now() - startTime}ms`);
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

  formatTags(tags: any): string {
    return Array.isArray(tags) ? tags.join(', ') : tags || '';
  }
}
