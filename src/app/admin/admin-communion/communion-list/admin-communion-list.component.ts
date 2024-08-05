import { Component } from '@angular/core';
import { Communion } from 'src/app/interfaces/communion.interface';
import { CommunionService } from 'src/app/services/communion.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-communion-list',
  templateUrl: './admin-communion-list.component.html',
  styleUrls: ['./admin-communion-list.component.css'],
})
export class AdminCommunionListComponent {
  communions: Communion[] = [];
  filteredCommunions: Communion[] = [];
  displayedCommunions: Communion[] = [];
  state: string = 'All';
  selectedCommunion: string = '';
  selectedCommunionForView: Communion | null = null;
  selectedCommunionForStatusChange: Communion | null = null;
  newRequestStatus: string = '';
  communionToEdit: Communion | null = null;

  constructor(private communionService: CommunionService) {}

  ngOnInit(): void {
    this.fetchCommunions();
  }

  fetchCommunions(): void {
    switch (this.state) {
      case 'All':
        console.log('Obteniendo todas las comuniones...');
        this.communionService.getAllCommunions().subscribe(
          (data: Communion[]) => {
            this.communions = data;
            this.filterCommunions();
            console.log(
              'Communiones obtenidos correctamente:',
              this.communions
            );
          },
          (error) => {
            console.error('Error al obtener comuniones', error);
          }
        );
        break;
      case 'P':
        console.log('Obteniendo comuniones pendientes...');
        this.communionService.getPendingCommunions().subscribe(
          (data: Communion[]) => {
            this.communions = data;
            this.filterCommunions();
            console.log(
              'Communiones pendientes obtenidos correctamente:',
              this.communions
            );
          },
          (error) => {
            console.error('Error al obtener comuniones pendientes', error);
          }
        );
        break;
      case 'A':
        console.log('Obteniendo communiones aceptados...');
        this.communionService.getAcceptedCommunions().subscribe(
          (data: Communion[]) => {
            this.communions = data;
            this.filterCommunions();
            console.log(
              'Communiones aceptadas obtenidas correctamente:',
              this.communions
            );
          },
          (error) => {
            console.error('Error al obtener communiones aceptadas', error);
          }
        );
        break;
      case 'R':
        console.log('Obteniendo communiones rechazados...');
        this.communionService.getRejectedCommunions().subscribe(
          (data: Communion[]) => {
            this.communions = data;
            this.filterCommunions();
            console.log(
              'Communiones rechazadas obtenidas correctamente:',
              this.communions
            );
          },
          (error) => {
            console.error('Error al obtener comuniones rechazadas', error);
          }
        );
        break;
      default:
        console.error('Estado de solicitud inválido');
    }
  }

  onRequestStatusChange(event: any): void {
    this.state = event.target.value;
    this.selectedCommunion = '';
    this.fetchCommunions();
  }

  onSearchSelectChange(): void {
    this.filterCommunions();
  }

  viewDetails(communion: Communion): void {
    this.selectedCommunionForView = communion;
  }

  closeViewModal(): void {
    this.selectedCommunionForView = null;
  }

  editCommunion(communion: Communion): void {
    this.communionToEdit = {
      ...communion,
      communionDate: this.formatDate(communion.communionDate),
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
    this.communionToEdit = null;
  }

  saveCommunion(): void {
    if (this.communionToEdit) {
      const originalCommunion = this.communions.find(
        (b) => b.id === this.communionToEdit!.id
      );

      if (!originalCommunion) {
        console.error('No se encontró la comunión original');
        Swal.fire('Error', 'No se encontró la comunión original', 'error');
        return;
      }

      const changesMade =
        this.communionToEdit.priest !== originalCommunion.priest ||
        this.communionToEdit.communionDate !==
          originalCommunion.communionDate ||
        this.communionToEdit.comment !== originalCommunion.comment ||
        this.communionToEdit.state !== originalCommunion.state;

      if (!changesMade) {
        console.log('No hubo cambios para actualizar');
        Swal.fire('Sin cambios', 'No hubo cambios para actualizar', 'info');
        return;
      }

      console.log('Cambios detectados, mostrando confirmación');
      Swal.fire({
        title: '¿Estás seguro?',
        text: '¿Deseas actualizar la comunión?',
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
            this.communionToEdit
          );
          this.communionService
            .updateCommunion(this.communionToEdit!)
            .subscribe(
              (updatedCommunion: Communion) => {
                console.log(
                  'Comunion actualizada correctamente',
                  updatedCommunion
                );
                Swal.fire(
                  'Actualizado',
                  'La comunion ha sido actualizada correctamente',
                  'success'
                );
                this.closeEditModal();
                this.fetchCommunions();
              },
              (error) => {
                console.error('Error al actualizar la comunion:', error);
                Swal.fire(
                  'Error',
                  'No se pudo actualizar la comunion',
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

  changeStatus(communion: Communion): void {
    this.selectedCommunionForStatusChange = communion;
    this.newRequestStatus = communion.state;
  }

  closeStatusChangeModal(): void {
    this.selectedCommunionForStatusChange = null;
  }

  setStatus(state: string): void {
    this.newRequestStatus = state;
    this.updateRequestStatus();
  }

  updateRequestStatus(): void {
    if (this.selectedCommunionForStatusChange && this.newRequestStatus) {
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
          const id = this.selectedCommunionForStatusChange?.id;
          if (id) {
            this.communionService
              .updateRequestStatus(id, this.newRequestStatus)
              .subscribe(
                (updatedCommunion: Communion) => {
                  Swal.fire(
                    'Actualizado!',
                    'El estado ha sido actualizado correctamente.',
                    'success'
                  );
                  console.log(
                    'Estado actualizado correctamente:',
                    updatedCommunion
                  );
                  this.fetchCommunions();
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

  filterCommunions(): void {
    if (this.selectedCommunion) {
      this.displayedCommunions = this.communions.filter(
        (communion) => communion.id === this.selectedCommunion
      );
    } else {
      this.displayedCommunions = this.communions.map((communion) => ({
        ...communion,
        communionDate: this.formatDate(communion.communionDate),
      }));
    }
  }
}
