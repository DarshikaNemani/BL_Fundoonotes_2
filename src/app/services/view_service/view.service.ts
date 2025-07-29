import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
export type ViewMode = 'grid' | 'list';

@Injectable({
  providedIn: 'root'
})
export class ViewService {
  private viewModeSubject = new BehaviorSubject<ViewMode>('grid');
  viewMode$ = this.viewModeSubject.asObservable();

  constructor() {
    const savedViewMode = localStorage.getItem('viewMode') as ViewMode;
    if (savedViewMode && (savedViewMode === 'grid' || savedViewMode === 'list')) {
      this.viewModeSubject.next(savedViewMode);
    }
  }

  getCurrentViewMode(): ViewMode {
    return this.viewModeSubject.value;
  }

  toggleViewMode(): void {
    const currentMode = this.viewModeSubject.value;
    const newMode: ViewMode = currentMode === 'grid' ? 'list' : 'grid';
    this.setViewMode(newMode);
  }

  setViewMode(mode: ViewMode): void {
    this.viewModeSubject.next(mode);
    localStorage.setItem('viewMode', mode);
  }
  private refreshNotesSubject = new Subject<void>();
  refreshNotes$ = this.refreshNotesSubject.asObservable();

  triggerRefresh() {
    this.refreshNotesSubject.next();  
  }
}
