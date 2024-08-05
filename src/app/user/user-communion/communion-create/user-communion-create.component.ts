import { Component } from '@angular/core';
import {
  Communion,
  CreateCommunion,
} from '../../../interfaces/communion.interface';
import { CommunionService } from 'src/app/services/communion.service';
import Swal from 'sweetalert2';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-user-communion-create',
  templateUrl: './user-communion-create.component.html',
  styleUrls: ['./user-communion-create.component.css'],
})
export class UserCommunionCreateComponent {
  createCommunion: CreateCommunion = {
    names: '',
    surnames: '',
    placeCommunion: '',
    enrolledCatechesis: '',
  };

  constructor(private communionService: CommunionService) {}

  onSubmit(communionForm: NgForm): void {
    if (!communionForm.valid) {
      Swal.fire(
        'Error',
        'Por favor complete todos los campos correctamente',
        'error'
      );
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Estás a punto de crear un nuevo registro.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        const newCommunion: Omit<Communion, 'id'> = {
          ...this.createCommunion,
          priest: '',
          communionDate: '',
          comment: '',
          state: 'P',
        };

        this.communionService
          .createCommunion(newCommunion as Communion)
          .subscribe(
            (response) => {
              console.log('Comunion creada exitosamente:', response);
              Swal.fire(
                'Éxito',
                'La comunión ha sido creada correctamente',
                'success'
              );
              this.resetForm(communionForm);
            },
            (error) => {
              console.error('Error al crear la comunión:', error);
              Swal.fire('Error', 'No se pudo crear la comunión', 'error');
            }
          );
      }
    });
  }

  resetForm(communionForm: NgForm): void {
    this.createCommunion = {
      names: '',
      surnames: '',
      placeCommunion: '',
      enrolledCatechesis: '',
    };
    communionForm.resetForm();
  }
}
