import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDrawerContainer, MatSidenavModule } from '@angular/material/sidenav';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { SidenavComponent } from '../../components/sidenav/sidenav.component';
import { NotesComponent } from 'src/app/components/notes/notes.component';
import { ViewService } from 'src/app/services/view_service/view.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ CommonModule,MatSidenavModule, NavbarComponent, SidenavComponent, RouterOutlet, NotesComponent ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('drawerContainer') drawerContainer!: MatDrawerContainer;
  @ViewChild('notesComp') notesComponent!: NotesComponent;
  sidenavCollapsed = true;

  constructor(private router: Router, private viewService: ViewService) {}

  ngAfterViewInit() {
    setTimeout(() => this.drawerContainer?.updateContentMargins(), 0);
  }

  get sidenavWidth() {
    return this.sidenavCollapsed ? '72px' : '280px';
  }

  toggleSidenavCollapse() {
    this.sidenavCollapsed = !this.sidenavCollapsed;
    setTimeout(() => this.drawerContainer?.updateContentMargins(), 300);
  }

onRefreshNotes() {
  this.viewService.triggerRefresh();
  console.log("Notes refreshed from home");
}
  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
