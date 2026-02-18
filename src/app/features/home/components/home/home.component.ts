import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { Child } from '../../../../core/models/user.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: false
})
export class HomeComponent implements OnInit {
  activeChild: Child | null = null;

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userService.activeChild$.subscribe(child => {
      this.activeChild = child;
    });
  }

  get hasCompletedBookings(): boolean {
    return (this.activeChild?.bookings || []).some(b => b.status === 'completed');
  }

  navigateTo(route: string): void {
    this.router.navigate([`/${route}`]);
  }
}


