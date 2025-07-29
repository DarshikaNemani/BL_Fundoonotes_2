import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ViewService, ViewMode } from '../../services/view_service/view.service';
import { Subject, takeUntil } from 'rxjs';
import { SearchService } from 'src/app/services/search_service/search.service';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Output() toggleSidenav = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
  @Output() refreshNotes = new EventEmitter<void>();

  currentViewMode: ViewMode = 'grid';
  private destroy$ = new Subject<void>();
    searchValue = '';
    navbarTitle = 'Fundoonotes';


constructor(
  private viewService: ViewService,
  private searchService: SearchService,
  private router: Router,
  private activatedRoute: ActivatedRoute
) {}


  ngOnInit() {
    this.viewService.viewMode$.pipe(takeUntil(this.destroy$)).subscribe(mode => {
      this.currentViewMode = mode;
    });
    this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map(() => {
      let child = this.activatedRoute.firstChild;
      while (child?.firstChild) {
        child = child.firstChild;
      }
      return child?.snapshot.data?.['title'] || 'Fundoonotes';
    })
  ).subscribe((title: string) => {
    this.navbarTitle = title;
  });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onToggleSidenav() {
    this.toggleSidenav.emit();
  }

  onLogout() {
    this.logout.emit();
  }

  refreshPage() {
  this.refreshNotes.emit();
  console.log("Notes refreshed!")
}


  toggleViewMode() {
    this.viewService.toggleViewMode();
  }

  get viewToggleIcon(): string {
    return this.currentViewMode === 'grid' ? 'view_list' : 'view_module';
  }

  get viewToggleLabel(): string {
    return this.currentViewMode === 'grid' ? 'List View' : 'Grid View';
  }
  
  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchValue = value;
    this.searchService.setSearchTerm(value);
  }
}
