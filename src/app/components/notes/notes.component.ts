import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotesService, Note, Reminder } from '../../services/notes_service/notes.service';
import {
  ViewService,
  ViewMode,
} from '../../services/view_service/view.service';
import { TextFieldModule } from '@angular/cdk/text-field';
import { SearchService } from '../../services/search_service/search.service';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [
    TextFieldModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
  ],
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
  textareaHeight = '60px';
  editTextareaHeight = '60px';
  isFormPinned = false;
  showFormColorPicker = false;
  showNoteColorPicker = false;
  showMoreMenu = false;
  selectedFormColor = '#ffffff';
  selectedNoteForColor: Note | null = null;
  selectedNoteForMenu: Note | null = null;
  searchTerm: string = '';

  formReminder: string | null = null;
  showFormReminderMenu = false;
  showNoteReminderMenu = false;
  selectedNoteForReminder: Note | null = null;
  currentViewMode: ViewMode = 'grid';

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

  constructor(
    private fb: FormBuilder,
    private notesService: NotesService,
    private viewService: ViewService,
    private searchService: SearchService
  ) {
    this.noteForm = this.fb.group({
      title: [''],
      description: [''],
    });
  }

  ngOnInit() {
    this.loadNotes();
    this.viewService.viewMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe((mode) => {
        this.currentViewMode = mode;
      });
    this.viewService.refreshNotes$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadNotes());
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

  get activeNotes(): Note[] {
    return this.notes.filter(
      (note) =>
        (note.isArchived === false || note.isArchived === undefined) &&
        (note.isDeleted === false || note.isDeleted === undefined)
    );
  }

  get isListView(): boolean {
    return this.currentViewMode === 'list';
  }

  get isGridView(): boolean {
    return this.currentViewMode === 'grid';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;

    if (
      target.closest('.color-picker-popup') ||
      target.closest('.dropdown-menu') ||
      target.closest('.reminder-menu')
    ) {
      return;
    }

    if (this.isEditing && this.editNoteId) {
      this.onSaveNote(this.editNoteId);
    }

    this.closeAllMenus();
  }

  private closeAllMenus() {
    this.showFormColorPicker = false;
    this.showNoteColorPicker = false;
    this.showMoreMenu = false;
    this.showFormReminderMenu = false;
    this.showNoteReminderMenu = false;
    this.selectedNoteForColor = null;
    this.selectedNoteForMenu = null;
    this.selectedNoteForReminder = null;
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
      setTimeout(() => {
        this.isExpanded = false;
        this.textareaHeight = '60px';
      }, 150);
    }
  }

  adjustTextareaHeight(event: any) {
    const textarea = event.target;
    textarea.style.height = 'auto';
    const newHeight = Math.max(60, textarea.scrollHeight);
    textarea.style.height = newHeight + 'px';
    this.textareaHeight = newHeight + 'px';
  }

  toggleFormPin(event: Event) {
    event.stopPropagation();
    this.isFormPinned = !this.isFormPinned;
  }

  adjustEditTextareaHeight(event: any) {
    const textarea = event.target;
    textarea.style.height = 'auto';
    const newHeight = Math.max(60, textarea.scrollHeight);
    textarea.style.height = newHeight + 'px';
    this.editTextareaHeight = newHeight + 'px';
  }

  toggleFormColorPicker(event: Event) {
    event.stopPropagation();
    this.showFormColorPicker = !this.showFormColorPicker;
    this.showNoteColorPicker = false;
    this.showMoreMenu = false;
    this.showFormReminderMenu = false;
    this.showNoteReminderMenu = false;
    this.selectedNoteForColor = null;
    this.selectedNoteForMenu = null;
    this.selectedNoteForReminder = null;
  }

  toggleNoteColorPicker(event: Event, note: Note) {
    event.stopPropagation();

    this.showFormColorPicker = false;
    this.showMoreMenu = false;
    this.showFormReminderMenu = false;
    this.showNoteReminderMenu = false;
    this.selectedNoteForMenu = null;
    this.selectedNoteForReminder = null;

    if (this.selectedNoteForColor?.id === note.id && this.showNoteColorPicker) {
      this.showNoteColorPicker = false;
      this.selectedNoteForColor = null;
    } else {
      this.selectedNoteForColor = note;
      this.showNoteColorPicker = true;
    }
  }

  toggleMoreMenu(event: Event, note: Note) {
    event.stopPropagation();

    this.showFormColorPicker = false;
    this.showNoteColorPicker = false;
    this.showFormReminderMenu = false;
    this.showNoteReminderMenu = false;
    this.selectedNoteForColor = null;
    this.selectedNoteForReminder = null;

    if (this.selectedNoteForMenu?.id === note.id && this.showMoreMenu) {
      this.showMoreMenu = false;
      this.selectedNoteForMenu = null;
    } else {
      this.selectedNoteForMenu = note;
      this.showMoreMenu = true;
    }
  }

  toggleFormReminderMenu(event: Event) {
    event.stopPropagation();
    this.showFormReminderMenu = !this.showFormReminderMenu;
    this.showFormColorPicker = false;
    this.showNoteColorPicker = false;
    this.showMoreMenu = false;
    this.showNoteReminderMenu = false;
    this.selectedNoteForColor = null;
    this.selectedNoteForMenu = null;
    this.selectedNoteForReminder = null;
  }

  toggleNoteReminderMenu(event: Event, note: Note) {
    event.stopPropagation();

    this.showFormColorPicker = false;
    this.showNoteColorPicker = false;
    this.showMoreMenu = false;
    this.showFormReminderMenu = false;
    this.selectedNoteForColor = null;
    this.selectedNoteForMenu = null;

    if (this.selectedNoteForReminder?.id === note.id && this.showNoteReminderMenu) {
      this.showNoteReminderMenu = false;
      this.selectedNoteForReminder = null;
    } else {
      this.selectedNoteForReminder = note;
      this.showNoteReminderMenu = true;
    }
  }

setFormReminder(type: 'later_today' | 'tomorrow' | 'next_week') {
  const now = new Date();
  let reminderDate: Date;

  switch (type) {
    case 'later_today':
      reminderDate = new Date(now);
      reminderDate.setHours(20, 0, 0, 0);
      break;

    case 'tomorrow':
      reminderDate = new Date(now);
      reminderDate.setDate(now.getDate() + 1);
      reminderDate.setHours(8, 0, 0, 0);
      break;

    case 'next_week':
      reminderDate = new Date(now);
      reminderDate.setDate(now.getDate() + 7);
      reminderDate.setHours(8, 0, 0, 0);
      break;
  }

  this.formReminder = reminderDate.toISOString();
  this.showFormReminderMenu = false;
}

  setNoteReminder(note: Note, type: 'later_today' | 'tomorrow' | 'next_week') {
    if (!note.id) return;

    this.notesService.setQuickReminder(note.id, type).subscribe({
      next: () => {
        console.log('Reminder set successfully');
        this.loadNotes();
        this.showNoteReminderMenu = false;
        this.selectedNoteForReminder = null;
      },
      error: (error) => console.error('Error setting reminder:', error),
    });
  }

  removeFormReminder(event: Event) {
    event.stopPropagation();
    this.formReminder = null;
  }

  removeNoteReminder(note: Note) {
    if (!note.id) return;

    this.notesService.removeReminder(note.id).subscribe({
      next: () => {
        console.log('Reminder removed successfully');
        this.loadNotes();
        this.showNoteReminderMenu = false;
        this.selectedNoteForReminder = null;
      },
      error: (error) => console.error('Error removing reminder:', error),
    });
  }

  openCustomDateTimePicker() {
    console.log('Open custom date/time picker');
    this.showFormReminderMenu = false;
  }

  openLocationPicker() {
    console.log('Open location picker');
    this.showFormReminderMenu = false;
  }

  openNoteCustomDateTimePicker(note: Note) {
    console.log('Open custom date/time picker for note:', note.id);
    this.showNoteReminderMenu = false;
    this.selectedNoteForReminder = null;
  }

  openNoteLocationPicker(note: Note) {
    console.log('Open location picker for note:', note.id);
    this.showNoteReminderMenu = false;
    this.selectedNoteForReminder = null;
  }

formatReminderDisplay(reminderString: string): string {
  if (!reminderString) return '';

  const reminderDate = new Date(reminderString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const reminderDay = new Date(reminderDate.getFullYear(), reminderDate.getMonth(), reminderDate.getDate());

  if (reminderDay.getTime() === today.getTime()) {
    return `Today, ${this.formatTime(reminderDate)}`;
  } else if (reminderDay.getTime() === tomorrow.getTime()) {
    return `Tomorrow, ${this.formatTime(reminderDate)}`;
  } else {
    const dayName = reminderDate.toLocaleDateString('en-US', { weekday: 'short' });
    return `${dayName}, ${this.formatTime(reminderDate)}`;
  }
}

formatNoteReminderDisplay(reminderString: string): string {
  return this.formatReminderDisplay(reminderString);
}

private formatTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHour}:${displayMinutes} ${ampm}`;
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
        this.closeAllMenus();
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
        this.closeAllMenus();
      },
      error: (error) => console.error('Error deleting note:', error),
    });
  }

  makeCopy(note: Note) {
    const newNote: Note = {
      title: note.title + ' (Copy)',
      description: note.description,
      color: note.color,
    };

    this.notesService.createNote(newNote).subscribe({
      next: () => {
        this.loadNotes();
        this.closeAllMenus();
      },
      error: (error) => console.error('Error copying note:', error),
    });
  }

  get filteredNotes(): Note[] {
    if (!this.searchTerm) return this.activeNotes;
    return this.activeNotes.filter(
      (note) =>
        (note.title && note.title.toLowerCase().includes(this.searchTerm)) ||
        (note.description &&
          note.description.toLowerCase().includes(this.searchTerm))
    );
  }

onSubmit() {
  const title = this.noteForm.value.title?.trim();
  const description = this.noteForm.value.description?.trim();

  if (title || description) {
    const note: Note = {
      title: title || '',
      description: description || '',
      color: this.selectedFormColor,
      isPined: this.isFormPinned,
      reminders: this.formReminder ? [this.formReminder] : undefined,
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
    this.textareaHeight = '60px';
    this.closeAllMenus();
    this.isFormPinned = false;
    this.formReminder = null;
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
    if (!this.isEditing && !this.showNoteColorPicker && !this.showMoreMenu && !this.showNoteReminderMenu) {
      this.onEditNote(note);
    }
  }

  toggleNotePin(event: Event, note: Note) {
    event.stopPropagation();

    if (!note.id) return;

    const newPinState = !note.isPined;

    this.notesService.pinUnpinNote(note.id, newPinState).subscribe({
      next: () => {
        console.log('Note pin state updated');
        note.isPined = newPinState;
        this.loadNotes();
      },
      error: (error) => console.error('Error updating pin state:', error),
    });
  }

  get pinnedNotes(): Note[] {
    return this.filteredNotes.filter((note) => note.isPined);
  }

  get otherNotes(): Note[] {
    return this.filteredNotes.filter((note) => !note.isPined);
  }

  onEditNote(note: Note) {
    this.closeAllMenus();
    this.isEditing = true;
    this.editNoteId = note.id || null;
    this.editTitle = note.title;
    this.editDescription = note.description;
    this.editTextareaHeight = '60px';
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
    this.editTextareaHeight = '60px';
    this.closeAllMenus();
  }
}
