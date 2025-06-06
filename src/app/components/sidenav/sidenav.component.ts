import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    CommonModule, 
    MatButtonModule, 
    MatIconModule, 
    RouterModule
  ],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent {
  @Input() isExpanded: boolean = false;
  selectedLabel: string = '';
  hoverLabel: string = '';

  navItems = [
    { icon: 'lightbulb', label: 'Notes', route: '/notes' },
    { icon: 'notifications', label: 'Reminders', route: '/reminders' },
    { icon: 'edit', label: 'Edit labels', route: '/edit-labels' },
    { icon: 'archive', label: 'Archive', route: '/archive' },
    { icon: 'delete', label: 'Trash', route: '/trash' },
  ];

  select(label: string) {
    this.selectedLabel = label;
  }

  setHover(label: string) {
    if (!this.isExpanded) {
      this.hoverLabel = label;
    }
  }

  clearHover() {
    this.hoverLabel = '';
  }
}
