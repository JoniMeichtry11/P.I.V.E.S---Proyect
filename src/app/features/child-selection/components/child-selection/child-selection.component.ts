import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { UserAccount, Child } from '../../../../core/models/user.model';
import { AVATARS } from '../../../../core/constants/app.constants';

@Component({
  selector: 'app-child-selection',
  templateUrl: './child-selection.component.html',
  styleUrls: ['./child-selection.component.css'],
  standalone: false
})
export class ChildSelectionComponent implements OnInit {
  account: UserAccount | null = null;
  showAddForm = false;
  avatars = AVATARS;
  
  newChild = {
    name: '',
    avatar: '🐶',
    gender: 'male' as 'male' | 'female'
  };

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

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  async addChild(): Promise<void> {
    if (!this.newChild.name || !this.newChild.avatar || !this.newChild.gender) return;
    
    try {
      await this.userService.addChild(this.newChild);
      this.toggleAddForm();
    } catch (error) {
      console.error('Error adding child:', error);
    }
  }

  private resetForm(): void {
    this.newChild = {
      name: '',
      avatar: '🐶',
      gender: 'male'
    };
  }
}
