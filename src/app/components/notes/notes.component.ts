import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotesService } from '../../services/notes_service/notes.service';

interface Note {
  id?: string;
  title: string;
  description: string;
  color?: string;
  isArchived?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, FormsModule, MatIconModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatProgressSpinnerModule ],
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
})
export class NotesComponent implements OnInit, OnDestroy {
  noteForm: FormGroup;
  notes: Note[] = [];
  isExpanded = false;
  isEditing = false;
  editNoteId: string | null = null;
  editTitle = '';
  editDescription = '';
  isLoading = false;

  showFormColorPicker = false;
  showNoteColorPicker = false;
  showMoreMenu = false;
  selectedFormColor = '#ffffff';
  selectedNoteForColor: Note | null = null;
  selectedNoteForMenu: Note | null = null;

  solidColors = [
    '#f28b82',
    '#fbbc04',
    '#fff475',
    '#ccff90',
    '#a7ffeb',
    '#cbf0f8',
    '#aecbfa',
    '#d7aefb',
    '#fdcfe8',
    '#e6c9a8',
    '#e8eaed',
  ];

  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder, private notesService: NotesService) {
    this.noteForm = this.fb.group({
      title: [''],
      description: [''],
    });
  }

  ngOnInit() {
    this.loadNotes();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Getter to filter active notes (not archived and not deleted)
  get activeNotes(): Note[] {
    return this.notes.filter(
      (note) =>
        (note.isArchived === false || note.isArchived === undefined) &&
        (note.isDeleted === false || note.isDeleted === undefined)
    );
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    this.showFormColorPicker = false;
    this.showNoteColorPicker = false;
    this.showMoreMenu = false;
    this.selectedNoteForColor = null;
    this.selectedNoteForMenu = null;
  }

  trackByNoteId(index: number, note: Note): string {
    return note.id || index.toString();
  }

  expandForm() {
    this.isExpanded = true;
  }

  onInputBlur() {
    if (
      !this.noteForm.value.title?.trim() &&
      !this.noteForm.value.description?.trim()
    ) {
      setTimeout(() => (this.isExpanded = false), 150);
    }
  }

  toggleFormColorPicker(event: Event) {
    event.stopPropagation();
    this.showFormColorPicker = !this.showFormColorPicker;
    this.showNoteColorPicker = false;
    this.showMoreMenu = false;
  }

  toggleNoteColorPicker(event: Event, note: Note) {
    event.stopPropagation();
    this.selectedNoteForColor = note;
    this.showNoteColorPicker = !this.showNoteColorPicker;
    this.showFormColorPicker = false;
    this.showMoreMenu = false;
  }


  selectFormColor(color: string) {
    this.selectedFormColor = color;
    this.showFormColorPicker = false;
  }

  changeNoteColor(note: Note, color: string) {
    note.color = color;
    this.showNoteColorPicker = false;
    this.selectedNoteForColor = null;

    if (note.id) {
      this.notesService.updateNoteColor(note.id, color).subscribe({
        next: () => console.log('Note color updated'),
        error: (error) => console.error('Error updating note color:', error),
      });
    }
  }

  onArchiveNote(noteId: string) {
    this.notesService.archiveNote(noteId).subscribe({
      next: () => {
        console.log('Note archived');
        this.loadNotes();
      },
      error: (error) => console.error('Error archiving note:', error),
    });
  }

  onDeleteNote(noteId: string | undefined) {
    if (!noteId) return;

    this.notesService.deleteNote(noteId).subscribe({
      next: () => {
        console.log('Note moved to trash');
        this.loadNotes();
        this.showMoreMenu = false;
        this.selectedNoteForMenu = null;
      },
      error: (error) => console.error('Error deleting note:', error),
    });
  }

  onSubmit() {
    const title = this.noteForm.value.title?.trim();
    const description = this.noteForm.value.description?.trim();

    if (title || description) {
      const note: Note = {
        title: title || '',
        description: description || '',
        color: this.selectedFormColor,
      };

      this.notesService
        .createNote(note)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadNotes();
            this.resetForm();
          },
          error: (error) => console.error('Error creating note:', error),
        });
    } else {
      this.resetForm();
    }
  }

  resetForm() {
    this.noteForm.reset();
    this.isExpanded = false;
    this.selectedFormColor = '#ffffff';
  }

  loadNotes() {
    this.isLoading = true;
    this.notesService
      .getAllNotes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.notes = response.data?.data || response.data || [];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading notes:', error);
          this.notes = [];
          this.isLoading = false;
        },
      });
  }

  onNoteClick(note: Note) {
    if (!this.isEditing && !this.showNoteColorPicker && !this.showMoreMenu) {
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
      this.notesService.updateNote(noteId, title, description).subscribe({
        next: () => {
          this.loadNotes();
          this.onCancelEdit();
        },
        error: (error) => console.error('Error updating note:', error),
      });
    } else {
      this.onCancelEdit();
    }
  }

  onCancelEdit() {
    this.isEditing = false;
    this.editNoteId = null;
    this.editTitle = '';
    this.editDescription = '';
  }
}
