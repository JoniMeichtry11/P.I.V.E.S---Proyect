import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { Event } from '../../../../core/models/user.model';
import { EventService } from '../../../../core/services/event.service';
import { AdminService } from '../../../../core/services/admin.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Unsubscribe } from 'firebase/firestore';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  standalone: false
})
export class MapComponent implements OnInit, OnDestroy {
  @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;
  @ViewChild(MapInfoWindow, { static: false }) infoWindow!: MapInfoWindow;

  events: Event[] = [];
  isAdmin = false;
  isLoading = true;
  showEventForm = false;
  editingEvent: Event | null = null;
  selectedEvent: Event | null = null;
  deletingEventId: string | null = null;

  // Google Maps Options
  center: google.maps.LatLngLiteral = { lat: -34.6037, lng: -58.3816 };
  zoom = 12;
  options: google.maps.MapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
    maxZoom: 19,
    minZoom: 2,
    // Estilos por defecto del mapa normal
    styles: []
  };

  // Data pre-calculada para el mapa para evitar parpadeos
  mapEventsData: any[] = [];

  private unsubscribeEvents: Unsubscribe | null = null;

  // Colores vibrantes
  private categoryColors: Record<string, string> = {
    practica: '#22c55e',
    presentacion: '#ec4899',
    taller: '#f59e0b',
    competencia: '#ef4444'
  };

  constructor(
    private eventService: EventService,
    private adminService: AdminService,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.isAdmin = await this.adminService.isUserAdmin(user.uid, user.email || undefined);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.loadEvents();
    }, 500);
  }

  ngOnDestroy(): void {
    if (this.unsubscribeEvents) {
      this.unsubscribeEvents();
    }
  }

  private loadEvents(): void {
    this.unsubscribeEvents = this.eventService.subscribeToEvents((events) => {
      this.events = events;
      this.isLoading = false;
      this.prepareMapData();
      
      setTimeout(() => this.fitBounds(), 300);
    });
  }

  private prepareMapData(): void {
    // Pre-calculamos todo aquí para que el HTML reciba una referencia estable
    this.mapEventsData = this.events.map(event => {
      const color = this.categoryColors[event.category || ''] || '#0ea5e9';
      const emoji = this.getCategoryEmoji(event.category);
      
      const svgPin = `
        <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 0C8.95 0 0 8.95 0 20c0 14 20 30 20 30s20-16 20-30c0-11.05-8.95-20-20-20z" fill="${color}" stroke="white" stroke-width="2"/>
          <circle cx="20" cy="20" r="14" fill="white"/>
          <text x="20" y="27" font-size="20" text-anchor="middle" font-family="Arial">${emoji}</text>
        </svg>
      `;

      return {
        event,
        position: { lat: event.lat, lng: event.lng },
        markerOptions: {
          title: event.title,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgPin),
            scaledSize: new google.maps.Size(40, 50),
            anchor: new google.maps.Point(20, 50)
          }
        },
        polylineOptions: event.route && event.route.length >= 2 ? {
          path: event.route,
          strokeColor: color,
          strokeOpacity: 0.8,
          strokeWeight: 4,
          icons: [{
            icon: { path: google.maps.SymbolPath.CIRCLE, scale: 2, fillOpacity: 1, strokeColor: 'white' },
            offset: '0',
            repeat: '20px'
          }]
        } : null
      };
    });
  }

  fitBounds(): void {
    if (this.events.length === 0 || typeof google === 'undefined') return;
    
    const bounds = new google.maps.LatLngBounds();
    let hasValidPoints = false;
    
    this.events.forEach(event => {
      if (event.lat && event.lng) {
        bounds.extend({ lat: event.lat, lng: event.lng });
        hasValidPoints = true;
      }
    });

    if (hasValidPoints && this.map && this.map.googleMap) {
      this.map.googleMap.fitBounds(bounds);
      
      if (this.events.length === 1) {
        setTimeout(() => {
          if (this.map.googleMap) this.map.googleMap.setZoom(14);
        }, 100);
      }
    }
  }

  // Google Maps Marker Options - Personalizados y divertidos
  getMarkerOptions(event: Event): google.maps.MarkerOptions {
    const color = this.categoryColors[event.category || ''] || '#0ea5e9';
    const emoji = this.getCategoryEmoji(event.category);
    
    // Crear un marcador SVG dinámico con el emoji
    const svgPin = `
      <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 0C8.95 0 0 8.95 0 20c0 14 20 30 20 30s20-16 20-30c0-11.05-8.95-20-20-20z" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="20" cy="20" r="14" fill="white"/>
        <text x="20" y="27" font-size="20" text-anchor="middle" font-family="Arial">${emoji}</text>
      </svg>
    `;

    return {
      draggable: false,
      title: event.title,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgPin),
        scaledSize: new google.maps.Size(40, 50),
        anchor: new google.maps.Point(20, 50)
      },
      animation: google.maps.Animation.DROP
    };
  }

  getPolylineOptions(event: Event): google.maps.PolylineOptions {
    const color = this.categoryColors[event.category || ''] || '#0ea5e9';
    return {
      path: event.route,
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 5,
      icons: [{
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 3, fillOpacity: 1, strokeColor: 'white' },
        offset: '0',
        repeat: '20px'
      }]
    };
  }

  openInfoWindow(marker: MapMarker, event: Event): void {
    this.selectedEvent = event;
    this.infoWindow.open(marker);
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

  getCategoryLabel(category?: string): string {
    switch (category) {
      case 'practica': return 'Práctica';
      case 'presentacion': return 'Presentación';
      case 'taller': return 'Taller';
      case 'competencia': return 'Competencia';
      default: return 'Evento';
    }
  }

  getCategoryColorClass(category?: string): string {
    switch (category) {
      case 'practica': return 'cat-practica';
      case 'presentacion': return 'cat-presentacion';
      case 'taller': return 'cat-taller';
      case 'competencia': return 'cat-competencia';
      default: return 'cat-default';
    }
  }

  formatDisplayDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr + 'T12:00:00');
      return date.toLocaleDateString('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }

  focusOnEvent(event: Event): void {
    this.selectedEvent = event;
    if (this.map && this.map.googleMap && event.lat && event.lng) {
      this.map.googleMap.panTo({ lat: event.lat, lng: event.lng });
      this.map.googleMap.setZoom(15);
    }
  }

  // --- CRUD Methods ---
  openCreateForm(): void {
    this.editingEvent = null;
    this.showEventForm = true;
  }

  openEditForm(event: Event): void {
    this.editingEvent = event;
    this.showEventForm = true;
  }

  closeForm(): void {
    this.showEventForm = false;
    this.editingEvent = null;
  }

  async onSaveEvent(eventData: Omit<Event, 'id'>): Promise<void> {
    try {
      if (this.editingEvent?.id) {
        await this.eventService.updateEvent(this.editingEvent.id, eventData);
      } else {
        await this.eventService.createEvent(eventData);
      }
      this.closeForm();
    } catch (error) {
      console.error('Error guardando evento:', error);
      alert('Error al guardar el evento. Intenta de nuevo.');
    }
  }

  async confirmDeleteEvent(event: Event): Promise<void> {
    this.deletingEventId = event.id!;
  }

  async deleteEvent(event: Event): Promise<void> {
    if (!event.id) return;
    try {
      await this.eventService.deleteEvent(event.id);
      this.deletingEventId = null;
      if (this.selectedEvent?.id === event.id) {
        this.selectedEvent = null;
      }
    } catch (error) {
      console.error('Error eliminando evento:', error);
      alert('Error al eliminar el evento. Intenta de nuevo.');
    }
  }

  cancelDelete(): void {
    this.deletingEventId = null;
  }
}
