import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotesService } from '../../services/notes_service/notes.service';
import { ViewService, ViewMode } from '../../services/view_service/view.service';
import { SearchService } from 'src/app/services/search_service/search.service';

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

  currentViewMode: ViewMode = 'grid';

  private destroy$ = new Subject<void>();
  searchTerm: string = '';

  constructor(
    private notesService: NotesService,
    private viewService: ViewService,
    private searchService: SearchService
  ) {}

  ngOnInit() {
    this.loadTrashedNotes();
    
    this.viewService.viewMode$.pipe(takeUntil(this.destroy$)).subscribe(mode => {
      this.currentViewMode = mode;
    });
              this.searchService.searchTerm$
      .pipe(takeUntil(this.destroy$))
      .subscribe(term => {
        this.searchTerm = term.trim().toLowerCase();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isListView(): boolean {
    return this.currentViewMode === 'list';
  }

  get isGridView(): boolean {
    return this.currentViewMode === 'grid';
  }

  trackByNoteId(index: number, note: Note): string {
    return note.id || index.toString();
  }
  get filteredNotes(): Note[] {
    if (!this.searchTerm) return this.trashedNotes;
    return this.trashedNotes.filter(
      (note) =>
        (note.title && note.title.toLowerCase().includes(this.searchTerm)) ||
        (note.description &&
          note.description.toLowerCase().includes(this.searchTerm))
    );
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
