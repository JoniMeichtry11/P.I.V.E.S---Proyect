import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SponsorService } from '../../../../core/services/sponsor.service';
import { Sponsor } from '../../../../core/models/user.model';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.css'],
  standalone: false
})
export class LandingPage implements OnInit {
  institutions: Sponsor[] = [];
  businesses: Sponsor[] = [];
  sponsors: Sponsor[] = [];
  sponsorsLoaded = false;

  constructor(
    private meta: Meta,
    private title: Title,
    private sponsorService: SponsorService
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Proyecto P.I.V.E.S. - Educación que salva vidas');
    this.meta.updateTag({ name: 'description', content: 'Proyecto P.I.V.E.S. es una aplicación interactiva dedicada a la educación vial para niños y familias, fomentando la seguridad y prevención de accidentes.' });
    this.meta.updateTag({ name: 'keywords', content: 'educación vial, niños, seguridad, prevención, pives, proyecto pives' });

    this.loadSponsors();
  }

  private async loadSponsors(): Promise<void> {
    try {
      const allSponsors = await this.sponsorService.getActiveSponsors();
      this.institutions = allSponsors.filter(s => s.category === 'institution');
      this.businesses = allSponsors.filter(s => s.category === 'business');
      this.sponsors = allSponsors.filter(s => s.category === 'sponsor');
    } catch (error) {
      console.error('Error loading sponsors for landing:', error);
    } finally {
      this.sponsorsLoaded = true;
    }
  }
}
