import { Injectable } from '@angular/core';
import { HttpService } from '../http_service/http.service';
import { Observable } from 'rxjs';

interface Note {
  id?: string;
  title: string;
  description: string;
  color?: string;
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
    return this.httpService.deleteApi(`/notes/deleteForeverNotes/${noteId}`);
  }

  updateNoteColor(noteId: string, color: string): Observable<any> {
    return this.httpService.postApi('/notes/changesColorNotes', {
      noteIdList: [noteId],
      color,
    });
  }

  // Bulk operations
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
