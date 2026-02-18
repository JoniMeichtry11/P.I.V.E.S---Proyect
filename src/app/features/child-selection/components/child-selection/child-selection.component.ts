import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { UserAccount, Child } from '../../../../core/models/user.model';

@Component({
  selector: 'app-child-selection',
  templateUrl: './child-selection.component.html',
  styleUrls: ['./child-selection.component.css'],
  standalone: false
})
export class ChildSelectionComponent implements OnInit {
  account: UserAccount | null = null;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userService.currentUserAccount$.subscribe(account => {
      this.account = account;
    });
  }

  selectChild(index: number): void {
    const child = this.account?.children[index];
    if (!child) return;

    this.userService.setActiveChildIndex(index);
    
    if (!child.hasCompletedOnboarding) {
      this.router.navigate(['/onboarding']);
    } else {
      this.router.navigate(['/home']);
    }
  }
}
