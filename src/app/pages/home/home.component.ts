import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDrawerContainer } from '@angular/material/sidenav';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { SidenavComponent } from '../../components/sidenav/sidenav.component';
import { NotesComponent } from '../../components/notes/notes.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    NavbarComponent,
    SidenavComponent,
    NotesComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('drawerContainer') drawerContainer!: MatDrawerContainer;
  
  sidenavCollapsed = false;

  constructor(private router: Router) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.drawerContainer?.updateContentMargins();
    }, 0);
  }

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
}
