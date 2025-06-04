import { Injectable } from '@angular/core';
import { HttpService } from '../http_service/http.service';
import { Observable } from 'rxjs';

interface Note {
  id?: string;
  title: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotesService {
  constructor(private httpService: HttpService) {}

  getAllNotes(): Observable<any> {
    return this.httpService.getApi('/notes/getNotesList');
  }

  createNote(note: Note): Observable<any> {
    return this.httpService.postApi('/notes/addNotes', note);
  }

  updateNote(noteId: string, title: string, description: string): Observable<any> {
    const formData = new FormData();
    formData.append('noteId', noteId);
    formData.append('title', title);
    formData.append('description', description);

    const headers = this.httpService.getHeaders();
    headers.delete('Content-Type');

    return this.httpService.postApi('/notes/updateNotes', formData);
  }

  deleteNote(noteId: string): Observable<any> {
    return this.httpService.deleteApi(`/notes/trashNotes/${noteId}`);
  }
}
