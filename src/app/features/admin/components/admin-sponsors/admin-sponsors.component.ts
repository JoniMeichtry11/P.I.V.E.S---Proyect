import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SponsorService } from '../../../../core/services/sponsor.service';
import { Sponsor, SponsorCategory } from '../../../../core/models/user.model';

@Component({
  selector: 'app-admin-sponsors',
  templateUrl: './admin-sponsors.component.html',
  styleUrls: ['./admin-sponsors.component.css'],
  standalone: false
})
export class AdminSponsorsComponent implements OnInit {
  allSponsors: Sponsor[] = [];
  filteredSponsors: Sponsor[] = [];
  loading = true;
  showForm = false;
  editingSponsor: Sponsor | null = null;
  activeFilter: SponsorCategory | 'all' = 'all';

  // Form model
  sponsorForm: Partial<Sponsor> = this.getEmptyForm();

  constructor(
    private sponsorService: SponsorService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadSponsors();
  }

  async loadSponsors(): Promise<void> {
    this.loading = true;
    try {
      this.allSponsors = await this.sponsorService.getSponsors();
      this.applyFilter();
    } catch (error) {
      console.error('Error loading sponsors:', error);
    }
    this.loading = false;
  }

  applyFilter(): void {
    if (this.activeFilter === 'all') {
      this.filteredSponsors = [...this.allSponsors];
    } else {
      this.filteredSponsors = this.allSponsors.filter(s => s.category === this.activeFilter);
    }
  }

  setFilter(filter: SponsorCategory | 'all'): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  openNewForm(): void {
    this.editingSponsor = null;
    this.sponsorForm = this.getEmptyForm();
    this.showForm = true;
  }

  editSponsor(sponsor: Sponsor): void {
    this.editingSponsor = sponsor;
    this.sponsorForm = { ...sponsor };
    this.showForm = true;
  }

  async saveSponsor(): Promise<void> {
    if (!this.sponsorForm.name || !this.sponsorForm.logoUrl || !this.sponsorForm.category) {
      alert('Por favor completá los campos obligatorios: nombre, logo URL y categoría.');
      return;
    }

    try {
      if (this.editingSponsor) {
        this.sponsorForm.id = this.editingSponsor.id;
      }
      await this.sponsorService.saveSponsor(this.sponsorForm);
      this.showForm = false;
      await this.loadSponsors();
    } catch (error) {
      console.error('Error saving sponsor:', error);
    }
  }

  async deleteSponsor(id: string): Promise<void> {
    if (!confirm('¿Estás seguro de que querés eliminar este sponsor?')) return;

    try {
      await this.sponsorService.deleteSponsor(id);
      await this.loadSponsors();
    } catch (error) {
      console.error('Error deleting sponsor:', error);
    }
  }

  async toggleActive(sponsor: Sponsor): Promise<void> {
    try {
      await this.sponsorService.toggleActive(sponsor.id, !sponsor.isActive);
      sponsor.isActive = !sponsor.isActive;
    } catch (error) {
      console.error('Error toggling sponsor:', error);
    }
  }

  getCategoryLabel(category: SponsorCategory): string {
    const labels: Record<SponsorCategory, string> = {
      'institution': '🏛️ Institución',
      'business': '🏪 Comercio',
      'sponsor': '🤝 Auspiciante'
    };
    return labels[category] || category;
  }

  getCategoryColor(category: SponsorCategory): string {
    const colors: Record<SponsorCategory, string> = {
      'institution': 'text-indigo-400',
      'business': 'text-emerald-400',
      'sponsor': 'text-amber-400'
    };
    return colors[category] || 'text-slate-400';
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }

  private getEmptyForm(): Partial<Sponsor> {
    return {
      name: '',
      description: '',
      logoUrl: '',
      websiteUrl: '',
      category: 'institution',
      isActive: true,
      order: this.allSponsors ? this.allSponsors.length + 1 : 1
    };
  }
}
