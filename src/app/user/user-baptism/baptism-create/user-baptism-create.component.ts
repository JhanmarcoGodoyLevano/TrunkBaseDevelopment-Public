import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BaptismService } from '../../../services/baptism.service';
import { CreateBaptism, Baptism } from '../../../interfaces/baptism.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-baptism-create',
  templateUrl: './user-baptism-create.component.html',
  styleUrls: ['./user-baptism-create.component.css'],
})
export class UserBaptismCreateComponent {
  createBaptism: CreateBaptism = {
    names: '',
    lastName: '',
    birthDate: '',
  };

  constructor(private baptismService: BaptismService) {}

  onSubmit(form: NgForm): void {
    console.log('Enviando formulario de bautismo:', this.createBaptism);

    if (
      this.createBaptism.names &&
      this.createBaptism.lastName &&
      this.createBaptism.birthDate
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
          const newBaptism: Omit<Baptism, 'idBaptism'> = {
            ...this.createBaptism,
            personId: null,
            storageId: null,
            paymentStatus: '',
            comment: '',
            catechesis: '',
            preparationTalk: '',
            baptismPlace: '',
            baptismDate: '',
            requestStatus: '',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          this.baptismService.createBaptism(newBaptism as Baptism).subscribe(
            (response) => {
              console.log('Bautismo creado exitosamente:', response);
              Swal.fire(
                'Éxito',
                'El bautismo ha sido creado correctamente',
                'success'
              );
              form.resetForm();
              this.createBaptism = {
                names: '',
                lastName: '',
                birthDate: '',
              };
            },
            (error) => {
              console.error('Error al crear el bautismo:', error);
              Swal.fire('Error', 'No se pudo crear el bautismo', 'error');
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
