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
    streetViewControl: false
  };

  markerOptions: google.maps.MarkerOptions = {
    draggable: false,
    animation: google.maps.Animation.DROP
  };

  polylineOptions: google.maps.PolylineOptions = {
    strokeColor: '#f59e0b',
    strokeOpacity: 0.8,
    strokeWeight: 4,
    icons: [{
      icon: { path: google.maps.SymbolPath.CIRCLE, scale: 2 },
      offset: '0',
      repeat: '15px'
    }]
  };

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
      // Forzar detección de cambios en el polyline
      this.routePoints = [...this.routePoints];
    }
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
