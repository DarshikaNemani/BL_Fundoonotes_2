import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDrawerContainer } from '@angular/material/sidenav';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NotesService } from '../../services/notes_service/notes.service';
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { SidenavComponent } from "../../components/sidenav/sidenav.component";

interface Note {
  id?: string;
  title: string;
  description: string;
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
    NavbarComponent,
    SidenavComponent,
    MatSidenavModule
],
  templateUrl: './trash.component.html',
  styleUrls: ['./trash.component.scss']
})
export class TrashComponent implements OnInit, OnDestroy {
   @ViewChild('drawerContainer') drawerContainer!: MatDrawerContainer;
   
  trashedNotes: Note[] = [];
  isLoading = false;
  
  private destroy$ = new Subject<void>();

  constructor(private notesService: NotesService, private router: Router) {}

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
    this.notesService.getTrashedNotes()
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
        }
      });
  }

  onNoteClick(note: Note) {
    //restore/delete actions
  }

  sidenavCollapsed = false;

  get sidenavWidth() {
    return this.sidenavCollapsed ? '72px' : '280px';
  }

  toggleSidenavCollapse() {
    this.sidenavCollapsed = !this.sidenavCollapsed;
    
    setTimeout(() => {
      this.drawerContainer?.updateContentMargins();
    }, 300);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  onRestoreNote(noteId: string | undefined) {
    if (!noteId) return;
    
    this.notesService.restoreNote(noteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadTrashedNotes();
        },
        error: (error) => {
          console.error('Error restoring note:', error);
        }
      });
  }

  onDeleteForever(noteId: string | undefined) {
    if (!noteId) return;
    
    if (confirm('This note will be permanently deleted. This action cannot be undone.')) {
      this.notesService.deleteNotePermanently(noteId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadTrashedNotes();
          },
          error: (error) => {
            console.error('Error permanently deleting note:', error);
          }
        });
    }
  }
}
