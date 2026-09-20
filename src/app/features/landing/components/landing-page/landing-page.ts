import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SponsorService } from '../../../../core/services/sponsor.service';
import { Sponsor } from '../../../../core/models/user.model';
import { LandingService } from '../../../../core/services/landing.service';
import { LandingContent } from '../../../../core/models/landing.model';
import { AuthService } from '../../../../core/services/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
  sponsorsLoaded = true;
  content: LandingContent;
  contentLoaded = true;
  isLoggedIn$: Observable<boolean>;

  constructor(
    private meta: Meta,
    private title: Title,
    private sponsorService: SponsorService,
    private landingService: LandingService,
    private authService: AuthService
  ) {
    this.isLoggedIn$ = this.authService.currentUser$.pipe(map(user => !!user));

    // Hidratar de forma SINCRÓNICA antes del primer render.
    // Si hay caché lo usa, si no usa los defaults hardcodeados.
    // Esto garantiza que NUNCA se muestre el spinner.
    this.content = this.landingService.getCachedContent() || this.landingService.getDefaultContent();

    const cachedSponsors = this.sponsorService.getCachedActiveSponsors();
    if (cachedSponsors && cachedSponsors.length > 0) {
      this.classifySponsors(cachedSponsors);
    }
  }

  ngOnInit(): void {
    this.title.setTitle('Proyecto P.I.V.E.S. - Educación que salva vidas');
    this.meta.updateTag({ name: 'description', content: 'Proyecto P.I.V.E.S. es una aplicación interactiva dedicada a la educación vial para niños y familias, fomentando la seguridad y prevención de accidentes.' });
    this.meta.updateTag({ name: 'keywords', content: 'educación vial, niños, seguridad, prevención, pives, proyecto pives' });

    // Revalidar contra Firestore en background (silencioso)
    this.revalidateContent();
    this.revalidateSponsors();
  }

  /**
   * Busca contenido fresco en Firestore y actualiza si cambió.
   */
  private async revalidateContent(): Promise<void> {
    try {
      await this.landingService.getLandingContent((updatedContent) => {
        this.content = updatedContent;
      });
    } catch (error) {
      console.warn('Error revalidating landing content:', error);
    }
  }

  /**
   * Busca sponsors frescos en Firestore y actualiza si cambió.
   */
  private async revalidateSponsors(): Promise<void> {
    try {
      const allSponsors = await this.sponsorService.getActiveSponsors((updatedSponsors) => {
        this.classifySponsors(updatedSponsors);
      });
      // Si no había caché, este es el primer resultado real de Firestore
      if (allSponsors.length > 0) {
        this.classifySponsors(allSponsors);
      }
    } catch (error) {
      console.error('Error revalidating sponsors:', error);
    }
  }

  /**
   * Clasifica los sponsors en las 3 categorías.
   */
  private classifySponsors(allSponsors: Sponsor[]): void {
    this.institutions = allSponsors.filter(s => s.category === 'institution');
    this.businesses = allSponsors.filter(s => s.category === 'business');
    this.sponsors = allSponsors.filter(s => s.category === 'sponsor');
  }
}

