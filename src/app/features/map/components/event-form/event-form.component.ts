import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Event } from '../../../../core/models/user.model';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css'],
  standalone: false
})
export class EventFormComponent implements OnInit, OnChanges {
  @Input() event: Event | null = null;
  @Output() save = new EventEmitter<Omit<Event, 'id'>>();
  @Output() cancel = new EventEmitter<void>();

  eventForm!: FormGroup;
  isSaving = false;
  mapMode: 'location' | 'route' = 'location';
  routePoints: { lat: number, lng: number }[] = [];

  // Google Maps Options
  center: google.maps.LatLngLiteral = { lat: -34.6037, lng: -58.3816 };
  zoom = 12;
  markerPosition: google.maps.LatLngLiteral | null = null;
  options: google.maps.MapOptions = {
    draggableCursor: 'crosshair',
    clickableIcons: false,
    mapTypeControl: false,
    streetViewControl: false,
    styles: [] // Estilo normal por defecto
  };

  // Referencias estables para evitar parpadeos
  dynamicMarkerOptions: google.maps.MarkerOptions = {};
  dynamicPolylineOptions: google.maps.PolylineOptions = {};

  get isEditing(): boolean {
    return this.event !== null && this.event.id !== undefined;
  }

  constructor(private fb: FormBuilder) {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      date: ['', Validators.required],
      time: [''],
      location: ['', Validators.required],
      description: ['', Validators.required],
      category: ['']
    });

    // Actualizar icono si cambia la categoría
    this.eventForm.get('category')?.valueChanges.subscribe(() => {
      this.updateMapOptions();
    });
  }

  // Colores vibrantes
  private categoryColors: Record<string, string> = {
    practica: '#22c55e',
    presentacion: '#ec4899',
    taller: '#f59e0b',
    competencia: '#ef4444'
  };

  private updateMapOptions(): void {
    if (this.markerPosition) {
      const category = this.eventForm.get('category')?.value;
      const color = this.categoryColors[category || ''] || '#0ea5e9';
      const emoji = this.getCategoryEmoji(category);
      
      const svgPin = `
        <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 0C8.95 0 0 8.95 0 20c0 14 20 30 20 30s20-16 20-30c0-11.05-8.95-20-20-20z" fill="${color}" stroke="white" stroke-width="2"/>
          <circle cx="20" cy="20" r="14" fill="white"/>
          <text x="20" y="27" font-size="20" text-anchor="middle" font-family="Arial">${emoji}</text>
        </svg>
      `;

      this.dynamicMarkerOptions = {
        draggable: false,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgPin),
          scaledSize: new google.maps.Size(40, 50),
          anchor: new google.maps.Point(20, 50)
        }
      };

      this.dynamicPolylineOptions = {
        path: this.routePoints,
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 4,
        icons: [{
          icon: { path: google.maps.SymbolPath.CIRCLE, scale: 2, fillOpacity: 1, strokeColor: 'white' },
          offset: '0',
          repeat: '20px'
        }]
      };
    }
  }

  getCategoryEmoji(category?: string): string {
    switch (category) {
      case 'practica': return '🏎️';
      case 'presentacion': return '🎉';
      case 'taller': return '📚';
      case 'competencia': return '🏆';
      default: return '📍';
    }
  }

  ngOnInit(): void {
    if (this.event) {
      this.initFromEvent();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['event'] && this.event) {
      this.initFromEvent();
    }
  }

  private initFromEvent(): void {
    if (!this.event) return;
    this.eventForm.patchValue({
      title: this.event.title,
      date: this.event.date,
      time: this.event.time || '',
      location: this.event.location,
      description: this.event.description,
      category: this.event.category || ''
    });
    this.routePoints = this.event.route ? [...this.event.route] : [];
    if (this.event.lat && this.event.lng) {
      this.markerPosition = { lat: this.event.lat, lng: this.event.lng };
      this.updateMapOptions();
      this.center = { ...this.markerPosition };
      this.zoom = 15;
    }
  }

  onMapClick(event: google.maps.MapMouseEvent): void {
    if (!event.latLng) return;
    const latlng = event.latLng.toJSON();

    if (this.mapMode === 'location') {
      this.markerPosition = latlng;
    } else {
      this.routePoints.push(latlng);
      this.routePoints = [...this.routePoints];
    }
    this.updateMapOptions();
  }

  clearRoute(): void {
    this.routePoints = [];
  }

  setMapMode(mode: 'location' | 'route'): void {
    this.mapMode = mode;
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('event-form-overlay')) {
      this.onCancel();
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  async onSubmit(): Promise<void> {
    if (this.eventForm.invalid) return;

    if (!this.markerPosition) {
      alert('Por favor, seleccioná una ubicación en el mapa haciendo clic.');
      return;
    }

    this.isSaving = true;
    const formValue = this.eventForm.value;

    const eventData: Omit<Event, 'id'> = {
      title: formValue.title,
      date: formValue.date,
      time: formValue.time || null,
      location: formValue.location,
      description: formValue.description,
      category: formValue.category || null,
      lat: this.markerPosition.lat,
      lng: this.markerPosition.lng,
      route: this.routePoints.length > 0 ? this.routePoints : undefined
    };

    this.save.emit(eventData);
  }
}
