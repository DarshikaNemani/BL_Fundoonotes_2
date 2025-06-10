import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotesService } from '../../services/notes_service/notes.service';

interface Note {
  id?: string;
  title: string;
  description: string;
  color?: string;
  isDeleted?: boolean;
}

@Component({
  selector: 'app-trash',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './trash.component.html',
  styleUrls: ['./trash.component.scss'],
})
export class TrashComponent implements OnInit, OnDestroy {
  trashedNotes: Note[] = [];
  isLoading = false;

  private destroy$ = new Subject<void>();

  constructor(private notesService: NotesService) {}

  ngOnInit() {
    this.loadTrashedNotes();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByNoteId(index: number, note: Note): string {
    return note.id || index.toString();
  }

  loadTrashedNotes() {
    this.isLoading = true;
    this.notesService
      .getTrashedNotes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.trashedNotes = response.data?.data || response.data || [];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading trashed notes:', error);
          this.trashedNotes = [];
          this.isLoading = false;
        },
      });
  }

  onNoteClick(note: Note) {
    // In trash, clicking doesn't edit - only restore/delete actions
  }

  onRestoreNote(noteId: string | undefined) {
    if (!noteId) return;

    this.notesService
      .restoreNote(noteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Note restored');
          this.loadTrashedNotes();
        },
        error: (error) => {
          console.error('Error restoring note:', error);
        },
      });
  }

  onDeleteForever(noteId: string | undefined) {
    if (!noteId) return;

    if (
      confirm(
        'This note will be permanently deleted. This action cannot be undone.'
      )
    ) {
      this.notesService
        .deleteNotePermanently(noteId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('Note deleted permanently');
            this.loadTrashedNotes();
          },
          error: (error) => {
            console.error('Error deleting permanently:', error);
          },
        });
    }
  }
}
