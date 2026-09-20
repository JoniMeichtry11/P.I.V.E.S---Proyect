import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { LandingService } from '../../../../core/services/landing.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { ErrorService } from '../../../../core/services/error.service';
import { LandingContent } from '../../../../core/models/landing.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-landing',
  templateUrl: './admin-landing.component.html',
  styleUrls: ['./admin-landing.component.css'],
  standalone: false
})
export class AdminLandingComponent implements OnInit, OnDestroy {
  landingForm!: FormGroup;
  activeTab = 'hero';
  
  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private landingService: LandingService,
    private loadingService: LoadingService,
    private errorService: ErrorService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadContent();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initForm(): void {
    this.landingForm = this.fb.group({
      hero: this.fb.group({
        badge: ['', Validators.required],
        title1: ['', Validators.required],
        title2: ['', Validators.required],
        description: ['', Validators.required],
        btn1: ['', Validators.required],
        btn2: ['', Validators.required]
      }),
      about: this.fb.group({
        badge: ['', Validators.required],
        title: ['', Validators.required],
        description: ['', Validators.required],
        missionTitle: ['', Validators.required],
        missionDesc: ['', Validators.required],
        visionTitle: ['', Validators.required],
        visionDesc: ['', Validators.required],
        methodTitle: ['', Validators.required],
        methodDesc: ['', Validators.required]
      }),
      features: this.fb.group({
        badge: ['', Validators.required],
        title: ['', Validators.required],
        items: this.fb.array([])
      }),
      institutions: this.fb.group({
        badge: ['', Validators.required],
        title: ['', Validators.required],
        description: ['', Validators.required]
      }),
      businesses: this.fb.group({
        badge: ['', Validators.required],
        title: ['', Validators.required],
        description: ['', Validators.required]
      }),
      sponsors: this.fb.group({
        badge: ['', Validators.required],
        title: ['', Validators.required],
        description: ['', Validators.required]
      }),
      steps: this.fb.group({
        badge: ['', Validators.required],
        title: ['', Validators.required],
        items: this.fb.array([])
      }),
      cta: this.fb.group({
        title: ['', Validators.required],
        description: ['', Validators.required],
        btn: ['', Validators.required]
      })
    });
  }

  get featuresItems() {
    return (this.landingForm.get('features') as FormGroup).get('items') as FormArray;
  }

  get stepsItems() {
    return (this.landingForm.get('steps') as FormGroup).get('items') as FormArray;
  }

  private async loadContent(): Promise<void> {
    await this.loadingService.executeWithLoading(async () => {
      try {
        const content = await this.landingService.getLandingContent();
        
        // Clear arrays before patching
        this.featuresItems.clear();
        content.features.items.forEach(() => {
          this.featuresItems.push(this.fb.group({
            title: ['', Validators.required],
            description: ['', Validators.required]
          }));
        });

        this.stepsItems.clear();
        content.steps.items.forEach(() => {
          this.stepsItems.push(this.fb.group({
            title: ['', Validators.required],
            description: ['', Validators.required]
          }));
        });

        this.landingForm.patchValue(content);
      } catch (error) {
        this.errorService.handleError(error, 'Error al cargar contenido', 'No se pudieron cargar los textos de la página de inicio.');
      }
    }, 'Cargando contenido de la página de inicio...');
  }

  async saveContent(): Promise<void> {
    if (this.landingForm.invalid) {
      this.errorService.showError('Formulario inválido', 'Por favor, completa todos los campos requeridos.');
      return;
    }

    await this.loadingService.executeWithLoading(async () => {
      try {
        const content: LandingContent = this.landingForm.value;
        await this.landingService.updateLandingContent(content);
        this.errorService.showInfo('Contenido guardado', 'Los textos se actualizaron correctamente.');
      } catch (error) {
        this.errorService.handleError(error, 'Error al guardar', 'No se pudieron guardar los cambios.');
      }
    }, 'Guardando cambios...');
  }
}
