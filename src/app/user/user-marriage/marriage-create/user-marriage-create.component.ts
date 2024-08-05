import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import {
  CreateMarriage,
  Marriage,
} from 'src/app/interfaces/marriage.interface';
import { MarriageService } from 'src/app/services/marriage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-marriage-create',
  templateUrl: './user-marriage-create.component.html',
  styleUrls: ['./user-marriage-create.component.css'],
})
export class UserMarriageCreateComponent {
  createMarriage: CreateMarriage = {
    namesContractor1: '',
    surnameContractor1: '',
    namesContractor2: '',
    surnamesContractor2: '',
  };

  constructor(private marriageService: MarriageService) {}

  onSubmit(marriageForm: NgForm): void {
    if (!marriageForm.valid) {
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
        const newMarriage: Omit<Marriage, 'id'> = {
          ...this.createMarriage,
          priest: '',
          placeMarriage: '',
          dateMarriage: '',
          comment: '',
          state: 'P',
        };

        this.marriageService.createMarriage(newMarriage as Marriage).subscribe(
          (response) => {
            console.log('Matrimonio creado exitosamente:', response);
            Swal.fire(
              'Éxito',
              'El matrimonio ha sido creado correctamente',
              'success'
            );
            this.resetForm(marriageForm);
          },
          (error) => {
            console.error('Error al crear el matrimonio:', error);
            Swal.fire('Error', 'No se pudo crear el matrimonio', 'error');
          }
        );
      }
    });
  }

  resetForm(marriageForm: NgForm): void {
    this.createMarriage = {
      namesContractor1: '',
      surnameContractor1: '',
      namesContractor2: '',
      surnamesContractor2: '',
    };
    marriageForm.resetForm();
  }
}
