import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterModule],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent {
  @Input() isExpanded: boolean = false;
  selectedLabel: string = '';
  isHovering: boolean = false; // Changed from hoverLabel to boolean

  navItems = [
    { icon: 'lightbulb', label: 'Notes', route: '/dashboard' },
    { icon: 'notifications', label: 'Reminders', route: '/reminders' },
    { icon: 'edit', label: 'Edit labels', route: '/edit-labels' },
    { icon: 'archive', label: 'Archive', route: '/dashboard/archive' },
    { icon: 'delete', label: 'Trash', route: '/dashboard/trash' },
  ];

  select(label: string) {
    this.selectedLabel = label;
  }

  setHover() {
    if (!this.isExpanded) {
      this.isHovering = true;
    }
  }

  clearHover() {
    this.isHovering = false;
  }
}
