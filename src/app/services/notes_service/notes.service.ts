import { Injectable } from '@angular/core';
import { HttpService } from '../http_service/http.service';
import { Observable } from 'rxjs';

interface Reminder {
  date?: string;
  time?: string;
  location?: string;
  type?: 'time' | 'location';
}

interface Note {
  id?: string;
  title: string;
  description: string;
  color?: string;
  isPined?: boolean;
  isArchived?: boolean;
  isDeleted?: boolean;
  reminders?: string[];
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotesService {
  constructor(private httpService: HttpService) {}

  getAllNotes(): Observable<any> {
    return this.httpService.getApi('/notes/getNotesList');
  }

  getArchivedNotes(): Observable<any> {
    return this.httpService.getApi('/notes/getArchiveNotesList');
  }

  getTrashedNotes(): Observable<any> {
    return this.httpService.getApi('/notes/getTrashNotesList');
  }

  createNote(note: Note): Observable<any> {
    return this.httpService.postApi('/notes/addNotes', note);
  }

  updateNote(
    noteId: string,
    title: string,
    description: string
  ): Observable<any> {
    return this.httpService.postFormData(
      '/notes/updateNotes',
      this.createFormData({
        noteId,
        title,
        description,
      })
    );
  }

  archiveNote(noteId: string): Observable<any> {
    return this.httpService.postApi('/notes/archiveNotes', {
      noteIdList: [noteId],
      isArchived: true,
    });
  }

  unarchiveNote(noteId: string): Observable<any> {
    return this.httpService.postApi('/notes/archiveNotes', {
      noteIdList: [noteId],
      isArchived: false,
    });
  }

  deleteNote(noteId: string): Observable<any> {
    return this.httpService.postApi('/notes/trashNotes', {
      noteIdList: [noteId],
      isDeleted: true,
    });
  }

  restoreNote(noteId: string): Observable<any> {
    return this.httpService.postApi('/notes/trashNotes', {
      noteIdList: [noteId],
      isDeleted: false,
    });
  }

  deleteNotePermanently(noteId: string): Observable<any> {
    return this.httpService.postApi('/notes/deleteForeverNotes', {
      noteIdList: [noteId],
    });
  }

  pinUnpinNote(noteId: string, isPined: boolean): Observable<any> {
    const payload = {
      noteIdList: [noteId],
      isPined: isPined,
    };
    return this.httpService.postApi('/notes/pinUnpinNotes', payload);
  }

  updateNoteColor(noteId: string, color: string): Observable<any> {
    return this.httpService.postApi('/notes/changesColorNotes', {
      noteIdList: [noteId],
      color,
    });
  }

addUpdateReminder(noteId: string, reminders: string[]): Observable<any> {
  const payload = {
    noteIdList: [noteId],
    reminder: reminders,
  };
  return this.httpService.postApi('/notes/addUpdateReminderNotes', payload);
}

setQuickReminder(noteId: string, reminderType: 'later_today' | 'tomorrow' | 'next_week', customDateTime?: string): Observable<any> {
  let reminderString: string;
  const now = new Date();
  
  switch (reminderType) {
    case 'later_today':
      const laterToday = new Date(now);
      laterToday.setHours(20, 0, 0, 0);
      reminderString = laterToday.toISOString();
      break;
      
    case 'tomorrow':
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(8, 0, 0, 0);
      reminderString = tomorrow.toISOString();
      break;
      
    case 'next_week':
      const nextWeek = new Date(now);
      nextWeek.setDate(now.getDate() + 7);
      nextWeek.setHours(8, 0, 0, 0);
      reminderString = nextWeek.toISOString();
      break;
      
    default:
      if (customDateTime) {
        reminderString = new Date(customDateTime).toISOString();
      } else {
        throw new Error('Custom date time required for custom reminder');
      }
  }
  
  return this.addUpdateReminder(noteId, [reminderString]);
}

removeReminder(noteId: string): Observable<any> {
  return this.addUpdateReminder(noteId, []);
}


  getNotesWithReminders(): Observable<any> {
    return this.httpService.getApi('/notes/getReminderNotesList');
  }

  bulkArchive(noteIds: string[], isArchived: boolean): Observable<any> {
    return this.httpService.postApi('/notes/archiveNotes', {
      noteIdList: noteIds,
      isArchived,
    });
  }

  bulkTrash(noteIds: string[], isDeleted: boolean): Observable<any> {
    return this.httpService.postApi('/notes/trashNotes', {
      noteIdList: noteIds,
      isDeleted,
    });
  }

  private createFormData(data: Record<string, any>): FormData {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    return formData;
  }
}

export { Note, Reminder };
