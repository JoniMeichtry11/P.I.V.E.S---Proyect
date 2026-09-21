import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LandingConfigService } from '../../../../core/services/landing-config.service';
import { StorageService } from '../../../../core/services/storage.service';
import { LandingConfig, DEFAULT_LANDING_CONFIG } from '../../../../core/models/landing.model';
import { ErrorService } from '../../../../core/services/error.service';

@Component({
  selector: 'app-admin-landing',
  templateUrl: './admin-landing.component.html',
  styleUrls: ['./admin-landing.component.css'],
  standalone: false
})
export class AdminLandingComponent implements OnInit, OnDestroy {
  config: LandingConfig = JSON.parse(JSON.stringify(DEFAULT_LANDING_CONFIG));
  activeTab = 'hero';
  private configSub?: Subscription;
  isSaving = false;
  
  pendingUploads = new Map<string, File>();
  previewUrls = new Map<string, string>();

  tabs = [
    { id: 'hero', name: 'Hero / Portada' },
    { id: 'pilares', name: 'Pilares' },
    { id: 'elDesafio', name: 'El Desafío' },
    { id: 'proposito', name: 'Propósito' },
    { id: 'queEsPives', name: 'Qué es PIVES' },
    { id: 'comoFunciona', name: 'Cómo Funciona' },
    { id: 'familias', name: 'Familias' },
    { id: 'espaciosEducativos', name: 'Espacios' },
    { id: 'objetivo', name: 'Objetivo' },
    { id: 'ctaFinal', name: 'CTA Final' },
    { id: 'sponsors', name: 'Sponsors' },
    { id: 'footer', name: 'Footer' }
  ];

  constructor(
    private landingConfigService: LandingConfigService,
    private storageService: StorageService,
    private errorService: ErrorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.configSub = this.landingConfigService.config$.subscribe(config => {
      // Create a deep copy for editing
      this.config = JSON.parse(JSON.stringify(config));
    });
  }

  ngOnDestroy(): void {
    if (this.configSub) {
      this.configSub.unsubscribe();
    }
    this.previewUrls.forEach(url => URL.revokeObjectURL(url));
  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }

  onImageSelect(event: Event, section: keyof LandingConfig, property: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const key = `${section}.${property}`;
      this.pendingUploads.set(key, file);
      
      const previewUrl = URL.createObjectURL(file);
      this.previewUrls.set(key, previewUrl);
    }
  }

  getPreviewUrl(section: keyof LandingConfig, property: string): string {
    const key = `${section}.${property}`;
    if (this.previewUrls.has(key)) {
      return this.previewUrls.get(key)!;
    }
    const configSection = this.config[section] as any;
    return configSection ? configSection[property] : '';
  }

  async saveConfig(): Promise<void> {
    try {
      this.isSaving = true;

      // Upload pending files first
      for (const [key, file] of this.pendingUploads.entries()) {
        const [section, property] = key.split('.');
        const path = `landing/${section}_${Date.now()}_${file.name}`;
        const downloadUrl = await this.storageService.uploadImage(path, file);
        
        // Update the config with the new URL
        const configSection = this.config[section as keyof LandingConfig] as any;
        if (configSection) {
          configSection[property] = downloadUrl;
        }
      }

      await this.landingConfigService.updateConfig(this.config);

      // Clear pending uploads after successful save
      this.pendingUploads.clear();
      this.previewUrls.forEach(url => URL.revokeObjectURL(url));
      this.previewUrls.clear();

    } catch (error) {
      console.error('Error saving landing config:', error);
      this.errorService.handleError(error, 'Error al guardar', 'No se pudo guardar la configuración de la landing.');
    } finally {
      this.isSaving = false;
    }
  }
}
