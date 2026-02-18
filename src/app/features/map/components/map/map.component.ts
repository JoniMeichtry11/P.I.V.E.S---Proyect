import { Component } from '@angular/core';
import { EVENTS } from '../../../../core/constants/app.constants';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  standalone: false
})
export class MapComponent {
  get events() {
    return EVENTS;
  }
}


