import { Component } from '@angular/core';
import { Marriage } from 'src/app/interfaces/marriage.interface';
import { MarriageService } from 'src/app/services/marriage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-marriage-list',
  templateUrl: './admin-marriage-list.component.html',
  styleUrls: ['./admin-marriage-list.component.css'],
})
export class AdminMarriageListComponent {
  marriages: Marriage[] = [];
  filteredMarriages: Marriage[] = [];
  displayedMarriages: Marriage[] = [];
  state: string = 'All';
  selectedMarriage: string = '';
  selectedMarriageForView: Marriage | null = null;
  selectedMarriageForStatusChange: Marriage | null = null;
  newRequestStatus: string = '';
  marriageToEdit: Marriage | null = null;

  constructor(private marriageService: MarriageService) {}

  ngOnInit(): void {
    this.fetchMarriages();
  }

  fetchMarriages(): void {
    switch (this.state) {
      case 'All':
        console.log('Obteniendo todas las matrimonios...');
        this.marriageService.getAllMarriages().subscribe(
          (data: Marriage[]) => {
            this.marriages = data;
            this.filterMarriages();
            console.log('Matrimonios obtenidos correctamente:', this.marriages);
          },
          (error) => {
            console.error('Error al obtener matrimonios', error);
          }
        );
        break;
      case 'P':
        console.log('Obteniendo matrimonios pendientes...');
        this.marriageService.getPendingMarriages().subscribe(
          (data: Marriage[]) => {
            this.marriages = data;
            this.filterMarriages();
            console.log(
              'Matrimonios pendientes obtenidos correctamente:',
              this.marriages
            );
          },
          (error) => {
            console.error('Error al obtener matrimonios pendientes', error);
          }
        );
        break;
      case 'A':
        console.log('Obteniendo matrimonios aceptados...');
        this.marriageService.getAcceptedMarriages().subscribe(
          (data: Marriage[]) => {
            this.marriages = data;
            this.filterMarriages();
            console.log(
              'Matrimonios aceptadas obtenidas correctamente:',
              this.marriages
            );
          },
          (error) => {
            console.error('Error al obtener matrimonios aceptadas', error);
          }
        );
        break;
      case 'R':
        console.log('Obteniendo matrimonios rechazados...');
        this.marriageService.getRejectedMarriages().subscribe(
          (data: Marriage[]) => {
            this.marriages = data;
            this.filterMarriages();
            console.log(
              'Matrimonios rechazadas obtenidas correctamente:',
              this.marriages
            );
          },
          (error) => {
            console.error('Error al obtener matrimonios rechazadas', error);
          }
        );
        break;
      default:
        console.error('Estado de solicitud inválido');
    }
  }

  onRequestStatusChange(event: any): void {
    this.state = event.target.value;
    this.selectedMarriage = '';
    this.fetchMarriages();
  }

  onSearchSelectChange(): void {
    this.filterMarriages();
  }

  viewDetails(marriage: Marriage): void {
    this.selectedMarriageForView = marriage;
  }

  closeViewModal(): void {
    this.selectedMarriageForView = null;
  }

  editMarriage(marriage: Marriage): void {
    this.marriageToEdit = {
      ...marriage,
      dateMarriage: this.formatDate(marriage.dateMarriage),
    };
  }

  formatDate(date: string | null): string | null {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getUTCFullYear();
    const month = ('0' + (d.getUTCMonth() + 1)).slice(-2);
    const day = ('0' + d.getUTCDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  formatDateToLocal(date: string): string {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  }

  closeEditModal(): void {
    this.marriageToEdit = null;
  }

  saveMarriage(): void {
    if (this.marriageToEdit) {
      const originalMarriage = this.marriages.find(
        (b) => b.id === this.marriageToEdit!.id
      );

      if (!originalMarriage) {
        console.error('No se encontró el matrimonio original');
        Swal.fire('Error', 'No se encontró el matrimonio original', 'error');
        return;
      }

      const changesMade =
        this.marriageToEdit.priest !== originalMarriage.priest ||
        this.marriageToEdit.dateMarriage !== originalMarriage.dateMarriage ||
        this.marriageToEdit.placeMarriage !== originalMarriage.placeMarriage ||
        this.marriageToEdit.comment !== originalMarriage.comment ||
        this.marriageToEdit.state !== originalMarriage.state;

      if (!changesMade) {
        console.log('No hubo cambios para actualizar');
        Swal.fire('Sin cambios', 'No hubo cambios para actualizar', 'info');
        return;
      }

      console.log('Cambios detectados, mostrando confirmación');
      Swal.fire({
        title: '¿Estás seguro?',
        text: '¿Deseas actualizar el matrimonio?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, actualizar',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          console.log(
            'Enviando solicitud de actualización',
            this.marriageToEdit
          );
          this.marriageService.updateMarriage(this.marriageToEdit!).subscribe(
            (updatedMarriage: Marriage) => {
              console.log(
                'Matrimonio actualizado correctamente',
                updatedMarriage
              );
              Swal.fire(
                'Actualizado',
                'El matrimonio ha sido actualizado correctamente',
                'success'
              );
              this.closeEditModal();
              this.fetchMarriages();
            },
            (error) => {
              console.error('Error al actualizar el matrimonio:', error);
              Swal.fire(
                'Error',
                'No se pudo actualizar el matrimonio',
                'error'
              );
            }
          );
        } else {
          console.log('Actualización cancelada por el usuario');
        }
      });
    }
  }

  changeStatus(marriage: Marriage): void {
    this.selectedMarriageForStatusChange = marriage;
    this.newRequestStatus = marriage.state;
  }

  closeStatusChangeModal(): void {
    this.selectedMarriageForStatusChange = null;
  }

  setStatus(state: string): void {
    this.newRequestStatus = state;
    this.updateRequestStatus();
  }

  updateRequestStatus(): void {
    if (this.selectedMarriageForStatusChange && this.newRequestStatus) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: '¿Deseas actualizar el estado de la solicitud?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, actualizar',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          const id = this.selectedMarriageForStatusChange?.id;
          if (id) {
            this.marriageService
              .updateRequestStatus(id, this.newRequestStatus)
              .subscribe(
                (updatedMarriage: Marriage) => {
                  Swal.fire(
                    'Actualizado!',
                    'El estado ha sido actualizado correctamente.',
                    'success'
                  );
                  console.log(
                    'Estado actualizado correctamente:',
                    updatedMarriage
                  );
                  this.fetchMarriages();
                  this.closeStatusChangeModal();
                },
                (error) => {
                  Swal.fire(
                    'Error!',
                    'No se pudo actualizar el estado.',
                    'error'
                  );
                  console.error('Error al actualizar el estado:', error);
                }
              );
          } else {
            console.error('El ID del bautismo no está disponible.');
          }
        }
      });
    } else {
      console.error('No se ha seleccionado ningún bautismo o estado válido.');
    }
  }

  getStatusText(state: string): string {
    switch (state) {
      case 'P':
        return 'Pendiente';
      case 'A':
        return 'Aprobado';
      case 'R':
        return 'Rechazado';
      default:
        return 'Desconocido';
    }
  }

  filterMarriages(): void {
    if (this.selectedMarriage) {
      this.displayedMarriages = this.marriages.filter(
        (marriage) => marriage.id === this.selectedMarriage
      );
    } else {
      this.displayedMarriages = this.marriages.map((marriage) => ({
        ...marriage,
        dateMarriage: this.formatDate(marriage.dateMarriage),
      }));
    }
  }
}
