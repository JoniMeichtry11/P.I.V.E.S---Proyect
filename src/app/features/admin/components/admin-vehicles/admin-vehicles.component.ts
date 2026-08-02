import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { VehicleService } from '../../../../core/services/vehicle.service';
import { CarModel } from '../../../../core/models/user.model';

@Component({
  selector: 'app-admin-vehicles',
  templateUrl: './admin-vehicles.component.html',
  styleUrls: ['./admin-vehicles.component.css'],
  standalone: false
})
export class AdminVehiclesComponent implements OnInit {
  vehicles: CarModel[] = [];
  loading = true;
  savingId: string | null = null;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private vehicleService: VehicleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadVehicles();
  }

  async loadVehicles(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      this.vehicles = await this.vehicleService.getVehicles();
    } catch (error) {
      console.error(error);
      this.error = 'No se pudieron cargar los vehículos.';
    } finally {
      this.loading = false;
    }
  }

  async saveVehicle(vehicle: CarModel): Promise<void> {
    if (!vehicle.name.trim()) {
      this.error = 'El vehículo debe tener un nombre.';
      return;
    }

    if (!vehicle.image.trim()) {
      this.error = 'El vehículo debe tener una imagen.';
      return;
    }

    if (vehicle.pricePerSlot < 0) {
      this.error = 'El costo no puede ser negativo.';
      return;
    }

    this.savingId = vehicle.id;

    try {
      await this.vehicleService.updateVehicle(vehicle.id, {
        name: vehicle.name.trim(),
        image: vehicle.image.trim(),
        pricePerSlot: Number(vehicle.pricePerSlot)
      });

      this.successMessage = 'Vehículo actualizado correctamente.';
      setTimeout(() => this.successMessage = null, 3000);
    } catch (error) {
      console.error(error);
      this.error = 'No se pudo guardar el vehículo.';
    } finally {
      this.savingId = null;
    }
  }

  async addVehicle(): Promise<void> {
    try {
      await this.vehicleService.addVehicle({
        name: 'Nuevo vehículo',
        image: '',
        pricePerSlot: 2
      });

      await this.loadVehicles();
      this.successMessage = 'Vehículo agregado correctamente.';
    } catch (error) {
      console.error(error);
      this.error = 'No se pudo agregar el vehículo.';
    }
  }

  async deleteVehicle(vehicle: CarModel): Promise<void> {
    const confirmed = confirm(
      `¿Seguro que querés eliminar ${vehicle.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await this.vehicleService.deleteVehicle(vehicle.id);
      await this.loadVehicles();
      this.successMessage = 'Vehículo eliminado correctamente.';
    } catch (error) {
      console.error(error);
      this.error = 'No se pudo eliminar el vehículo.';
    }
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}