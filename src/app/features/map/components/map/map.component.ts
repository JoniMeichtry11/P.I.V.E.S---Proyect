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
    styles: [ // Estilo oscuro sutil opcional
      {
        "featureType": "all",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#747474" }, { "lightness": -40 }]
      }
    ]
  };

  private unsubscribeEvents: Unsubscribe | null = null;

  // Colores por categoría (para los marcadores personalizados en el futuro o polylines)
  private categoryColors: Record<string, string> = {
    practica: '#10b981',
    presentacion: '#8b5cf6',
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
    this.loadEvents();
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
      this.fitBounds();
    });
  }

  fitBounds(): void {
    if (this.events.length === 0) return;
    
    // Pequeño delay para que el mapa esté listo
    setTimeout(() => {
      if (typeof google === 'undefined') return;
      const bounds = new google.maps.LatLngBounds();
      this.events.forEach(event => {
        if (event.lat && event.lng) {
          bounds.extend({ lat: event.lat, lng: event.lng });
        }
      });
      if (this.map && this.map.googleMap) {
        this.map.googleMap.fitBounds(bounds);
      }
    }, 500);
  }

  // Google Maps Marker Options
  getMarkerOptions(event: Event): google.maps.MarkerOptions {
    const color = this.categoryColors[event.category || ''] || '#0ea5e9';
    return {
      draggable: false,
      title: event.title,
      icon: {
        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        fillColor: color,
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#FFFFFF',
        scale: 7
      }
    };
  }

  getPolylineOptions(event: Event): google.maps.PolylineOptions {
    const color = this.categoryColors[event.category || ''] || '#0ea5e9';
    return {
      path: event.route,
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 4,
      icons: [{
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 2 },
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
