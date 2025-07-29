import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotesService } from '../../services/notes_service/notes.service';
import {
  ViewService,
  ViewMode,
} from '../../services/view_service/view.service';
import { SearchService } from 'src/app/services/search_service/search.service';

interface Note {
  id?: string;
  title: string;
  description: string;
  color?: string;
  isArchived?: boolean;
}

@Component({
  selector: 'app-archive',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.scss'],
})
export class ArchiveComponent implements OnInit, OnDestroy {
  archivedNotes: Note[] = [];
  isEditing = false;
  editNoteId: string | null = null;
  editTitle = '';
  editDescription = '';
  isLoading = false;
  searchTerm: string = '';
  currentViewMode: ViewMode = 'grid';

  private destroy$ = new Subject<void>();

  constructor(
    private notesService: NotesService,
    private viewService: ViewService,
    private searchService: SearchService
  ) {}

  ngOnInit() {
    this.loadArchivedNotes();
    this.viewService.viewMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe((mode) => {
        this.currentViewMode = mode;
      });
    this.searchService.searchTerm$
      .pipe(takeUntil(this.destroy$))
      .subscribe((term) => {
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

  loadArchivedNotes() {
    this.isLoading = true;
    this.notesService
      .getArchivedNotes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.archivedNotes = response.data?.data || response.data || [];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading archived notes:', error);
          this.archivedNotes = [];
          this.isLoading = false;
        },
      });
  }

  onNoteClick(note: Note) {
    if (!this.isEditing) {
      this.onEditNote(note);
    }
  }

  onEditNote(note: Note) {
    this.isEditing = true;
    this.editNoteId = note.id || null;
    this.editTitle = note.title;
    this.editDescription = note.description;
  }

  onSaveNote(noteId: string | undefined) {
    if (!noteId) return;

    const title = this.editTitle.trim();
    const description = this.editDescription.trim();

    if (title || description) {
      this.notesService
        .updateNote(noteId, title, description)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadArchivedNotes();
            this.onCancelEdit();
          },
          error: (error) => {
            console.error('Error updating note:', error);
          },
        });
    }
  }

  onCancelEdit() {
    this.isEditing = false;
    this.editNoteId = null;
    this.editTitle = '';
    this.editDescription = '';
  }
  get filteredNotes(): Note[] {
    if (!this.searchTerm) return this.archivedNotes;
    return this.archivedNotes.filter(
      (note) =>
        (note.title && note.title.toLowerCase().includes(this.searchTerm)) ||
        (note.description &&
          note.description.toLowerCase().includes(this.searchTerm))
    );
  }
  onUnarchiveNote(noteId: string | undefined) {
    if (!noteId) return;

    this.notesService
      .unarchiveNote(noteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Note unarchived');
          this.loadArchivedNotes();
        },
        error: (error) => {
          console.error('Error unarchiving note:', error);
        },
      });
  }

  onDeleteNote(noteId: string | undefined) {
    if (!noteId) return;

    this.notesService
      .deleteNote(noteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Note moved to trash');
          this.loadArchivedNotes();
        },
        error: (error) => {
          console.error('Error deleting note:', error);
        },
      });
  }
}
