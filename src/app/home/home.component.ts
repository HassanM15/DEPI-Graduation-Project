import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UseracessService } from '../useracess.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink ,NavbarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  userName: string = 'User'; // Fallback name

  constructor(private userService: UseracessService, private router: Router) {}

  ngOnInit() {
    this.loadUserName();
  }

  loadUserName() {
    // Use getUserEmail() from UseracessService to get email from JWT
    const email = this.userService.getUserEmail();
    this.userName = email || 'User';
  }

  navigateToNotes() {
    this.router.navigate(['/notes']);
  }
}
