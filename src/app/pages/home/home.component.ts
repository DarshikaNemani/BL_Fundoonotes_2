import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSidenavModule } from '@angular/material/sidenav';

import { NotesService } from '../../services/notes_service/notes.service';

interface Note {
  id?: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSidenavModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  noteForm: FormGroup;
  isExpanded = false;
  notes: Note[] = [];
  isEditing = false;
  editNoteId: string | null = null;
  editTitle = '';
  editDescription = '';

  constructor(
    private fb: FormBuilder,
    private notesService: NotesService,
    private router: Router
  ) {
    this.noteForm = this.fb.group({
      title: [''],
      description: ['']
    });
    this.loadNotes();
  }

  expandForm() {
    this.isExpanded = true;
  }

  onSubmit() {
    if (this.noteForm.value.title?.trim() || this.noteForm.value.description?.trim()) {
      const note: Note = {
        title: this.noteForm.value.title || '',
        description: this.noteForm.value.description || ''
      };
      
      this.notesService.createNote(note).subscribe({
        next: (res) => {
          console.log('Note created:', res);
          this.loadNotes();
          this.noteForm.reset();
          this.isExpanded = false;
        },
        error: (err) => {
          console.error('Error creating note:', err);
        }
      });
    }
  }

  loadNotes() {
    this.notesService.getAllNotes().subscribe({
      next: (res) => {
        console.log('Notes response:', res);
        this.notes = res.data?.data || res.data || [];
      },
      error: (err) => {
        console.error('Error loading notes:', err);
        this.notes = [];
      }
    });
  }

  onEdit(note: Note) {
    this.isEditing = true;
    this.editNoteId = note.id || null;
    this.editTitle = note.title;
    this.editDescription = note.description;
  }

  onSave(noteId: string | undefined) {
    if (!noteId) return;
    
    if (this.editTitle.trim() || this.editDescription.trim()) {
      this.notesService.updateNote(noteId, this.editTitle, this.editDescription).subscribe({
        next: () => {
          this.loadNotes();
          this.isEditing = false;
          this.editNoteId = null;
          this.editTitle = '';
          this.editDescription = '';
        },
        error: (err) => {
          console.error('Error updating note:', err);
        }
      });
    }
  }

  onCancel() {
    this.isEditing = false;
    this.editNoteId = null;
    this.editTitle = '';
    this.editDescription = '';
  }

  onDelete(noteId: string | undefined) {
    if (!noteId) return;
    
    this.notesService.deleteNote(noteId).subscribe({
      next: () => {
        console.log('Note deleted');
        this.loadNotes();
      },
      error: (err) => {
        console.error('Error deleting note:', err);
      }
    });
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
