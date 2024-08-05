import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ConfirmationService } from '../../../services/confirmation.service';
import {
  CreateConfirmation,
  Confirmation,
} from '../../../interfaces/confirmation.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-confirmation-create',
  templateUrl: './user-confirmation-create.component.html',
  styleUrls: ['./user-confirmation-create.component.css'],
})
export class UserConfirmationCreateComponent {
  createConfirmation: CreateConfirmation = {
    names: '',
    lastName: '',
    birthDate: '',
  };

  constructor(private confirmationService: ConfirmationService) {}

  onSubmit(form: NgForm): void {
    console.log(
      'Enviando formulario de confirmación:',
      this.createConfirmation
    );

    if (
      this.createConfirmation.names &&
      this.createConfirmation.lastName &&
      this.createConfirmation.birthDate
    ) {
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
          const newConfirmation: Omit<Confirmation, 'id'> = {
            ...this.createConfirmation,
            applicantId: null,
            storageId: null,
            paymentStatus: '',
            comment: '',
            catechesis: '',
            bishop: '',
            confirmationPlace: '',
            confirmationDate: '',
            requestStatus: '',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          this.confirmationService
            .createConfirmation(newConfirmation as Confirmation)
            .subscribe(
              (response) => {
                console.log('Confirmación creado exitosamente:', response);
                Swal.fire(
                  'Éxito',
                  'El Confirmación ha sido creado correctamente',
                  'success'
                );
                form.resetForm();
                this.createConfirmation = {
                  names: '',
                  lastName: '',
                  birthDate: '',
                };
              },
              (error) => {
                console.error('Error al crear el confirmación:', error);
                Swal.fire('Error', 'No se pudo crear el confirmación', 'error');
              }
            );
        }
      });
    } else {
      Swal.fire('Error', 'Por favor complete todos los campos', 'error');
    }
  }

  validateDate(birthDateInput: any): void {
    const birthDate = new Date(birthDateInput.value);
    const currentYear = new Date().getFullYear();
    const minYear = 1900;

    if (birthDate.getFullYear() < minYear) {
      birthDateInput.control.setErrors({ pastDate: true });
    } else if (birthDate.getFullYear() > currentYear) {
      birthDateInput.control.setErrors({ futureDate: true });
    } else {
      birthDateInput.control.setErrors(null);
    }
  }

  checkBirthDateRequired(birthDateInput: any): void {
    if (!birthDateInput.value) {
      birthDateInput.control.markAsTouched();
      birthDateInput.control.setErrors({ required: true });
    }
  }

  hideInvalidYears(): void {
    const birthDateInput = document.getElementById(
      'birthDate'
    ) as HTMLInputElement;
    if (birthDateInput) {
      const currentYear = new Date().getFullYear();
      const pastYear = 1900;

      birthDateInput.setAttribute('max', `${currentYear}-12-31`);
      birthDateInput.setAttribute('min', `${pastYear}-01-01`);
    }
  }
}
