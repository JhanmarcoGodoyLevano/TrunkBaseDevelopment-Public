import { Component, OnInit, HostListener } from '@angular/core';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { Confirmation } from 'src/app/interfaces/confirmation.interface';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-admin-confirmation-list',
  templateUrl: './admin-confirmation-list.component.html',
  styleUrls: ['./admin-confirmation-list.component.css'],
})
export class AdminConfirmationListComponent implements OnInit {
  confirmations: Confirmation[] = [];
  filteredConfirmations: Confirmation[] = [];
  displayedConfirmations: Confirmation[] = [];
  requestStatus: string = 'P';
  selectedConfirmation: string = '';
  selectedConfirmationForView: Confirmation | null = null;
  selectedConfirmationForStatusChange: Confirmation | null = null;
  newRequestStatus: string = '';
  confirmationToEdit: Confirmation | null = null;
  currentPage: number = 1;
  itemsPerPage: number = 4;
  totalItems: number = 0;
  menuVisible: boolean = false;
  selectedCatechesis: string = '';
  catechesisOptions: string[] = ['', '1 vez', '2 veces', '3 veces'];
  selectedBishop: string = '';
  bishopOptions: string[] = [
    '',
    'José Luis Chávez Martínez',
    'Pedro Barreto Rebaque',
    'Gustavo Egozi Bianchi',
    'Luis Humberto Gutiérrez Pérez',
    'Manuel Antonio Zárate Aguirre',
    'Carlos Forno Berríos',
    'Tullio Poli',
    'Javier Del Río Gallego',
    'Lorenzo Leónidas Aguirre Salinas',
    'Víctor Raúl Gutiérrez Reynoso',
  ];

  constructor(private confirmationService: ConfirmationService) {}

  ngOnInit(): void {
    this.fetchConfirmations();
  }

  toggleMenu(): void {
    this.menuVisible = !this.menuVisible;
  }

  closeMenu(): void {
    this.menuVisible = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-button') && !target.closest('.menu-dropdown')) {
      this.closeMenu();
    }
  }

  fetchConfirmations(): void {
    switch (this.requestStatus) {
      case 'P':
        this.confirmationService.getPendingConfirmations().subscribe(
          (data: Confirmation[]) => {
            this.confirmations = data;
            this.totalItems = data.length;
            this.filterConfirmations();
          },
          (error) => {
            console.error('Error al obtener confirmaciones pendientes', error);
          }
        );
        break;
      case 'A':
        this.confirmationService.getAcceptedConfirmations().subscribe(
          (data: Confirmation[]) => {
            this.confirmations = data;
            this.totalItems = data.length;
            this.filterConfirmations();
          },
          (error) => {
            console.error('Error al obtener confirmaciones aceptadas', error);
          }
        );
        break;
      case 'R':
        this.confirmationService.getRejectedConfirmations().subscribe(
          (data: Confirmation[]) => {
            this.confirmations = data;
            this.totalItems = data.length;
            this.filterConfirmations();
          },
          (error) => {
            console.error('Error al obtener confirmaciones rechazadas', error);
          }
        );
        break;
      default:
        console.error('Estado de solicitud inválido');
    }
  }

  onSearchSelectChange(): void {
    this.currentPage = 1;
    this.filterConfirmations();
  }

  filterConfirmations(): void {
    if (this.selectedConfirmation) {
      this.filteredConfirmations = this.confirmations.filter(
        (confirmation) => confirmation.id === this.selectedConfirmation
      );
    } else {
      this.filteredConfirmations = this.confirmations;
    }

    this.filteredConfirmations = this.filteredConfirmations.map(
      (confirmation) => ({
        ...confirmation,
        confirmationDate: confirmation.confirmationDate
          ? this.adjustDateToLocal(new Date(confirmation.confirmationDate))
              .toISOString()
              .split('T')[0]
          : null,
        birthDate: confirmation.birthDate
          ? this.adjustDateToLocal(new Date(confirmation.birthDate))
              .toISOString()
              .split('T')[0]
          : null,
      })
    );

    this.updateDisplayedConfirmations();
  }

  onDownloadExcel(): void {
    const exportData = this.filteredConfirmations.map((confirmation) => ({
      Nombre: confirmation.names,
      Apellido: confirmation.lastName,
      FechaNacimiento: confirmation.birthDate,
      // Agrega más campos según tus necesidades
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const wb: XLSX.WorkBook = { Sheets: { data: ws }, SheetNames: ['data'] };
    XLSX.writeFile(wb, 'confirmaciones.xlsx');
  }

  onDownloadCSV(): void {
    const exportData = this.filteredConfirmations.map((confirmation) => ({
      Nombre: confirmation.names,
      Apellido: confirmation.lastName,
      FechaNacimiento: confirmation.birthDate,
      // Agrega más campos según tus necesidades
    }));

    const csvData = this.convertToCSV(exportData);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'confirmaciones.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error(
        'La descarga de archivos no es compatible en este navegador.'
      );
    }
  }

  private convertToCSV(objArray: any[]): string {
    const array =
      typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';

    for (let i = 0; i < array.length; i++) {
      let line = '';
      for (const index in array[i]) {
        if (line !== '') line += ',';
        line += array[i][index];
      }
      str += line + '\r\n';
    }
    return str;
  }

  onRequestStatusChange(event: any): void {
    this.requestStatus = event.target.value;
    this.selectedConfirmation = '';
    this.currentPage = 1;
    this.fetchConfirmations();
  }

  viewDetails(confirmation: Confirmation): void {
    this.selectedConfirmationForView = confirmation;
  }

  closeViewModal(): void {
    this.selectedConfirmationForView = null;
  }

  editConfirmation(confirmation: Confirmation): void {
    this.confirmationToEdit = { ...confirmation };
    this.confirmationToEdit.confirmationDate = confirmation.confirmationDate
      ? new Date(confirmation.confirmationDate).toISOString().split('T')[0]
      : null;
    this.confirmationToEdit.birthDate = confirmation.birthDate
      ? new Date(confirmation.birthDate).toISOString().split('T')[0]
      : null;
    this.selectedCatechesis =
      confirmation.catechesis || this.catechesisOptions[0];
    this.selectedBishop = confirmation.bishop || this.bishopOptions[0];
  }

  closeEditModal(): void {
    this.confirmationToEdit = null;
  }

  saveConfirmation(): void {
    if (this.confirmationToEdit) {
      const originalConfirmation = this.confirmations.find(
        (b) => b.id === this.confirmationToEdit!.id
      );

      if (!originalConfirmation) {
        console.error('No se encontró el confirmación original');
        Swal.fire('Error', 'No se encontró el confirmación original', 'error');
        return;
      }

      const changesMade =
        this.confirmationToEdit.catechesis !==
          originalConfirmation.catechesis ||
        this.confirmationToEdit.bishop !== originalConfirmation.bishop ||
        this.confirmationToEdit.paymentStatus !==
          originalConfirmation.paymentStatus ||
        this.confirmationToEdit.confirmationDate !==
          originalConfirmation.confirmationDate ||
        this.confirmationToEdit.confirmationPlace !==
          originalConfirmation.confirmationPlace ||
        this.confirmationToEdit.comment !== originalConfirmation.comment;

      if (!changesMade) {
        Swal.fire('Sin cambios', 'No hubo cambios para actualizar', 'info');
        return;
      }

      Swal.fire({
        title: '¿Estás seguro?',
        text: '¿Deseas actualizar el confirmación?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, actualizar',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          this.confirmationToEdit!.catechesis = this.selectedCatechesis;
          this.confirmationToEdit!.bishop = this.selectedBishop;

          this.confirmationService
            .updateConfirmation(this.confirmationToEdit!)
            .subscribe(
              (updatedConfirmation: Confirmation) => {
                Swal.fire(
                  'Actualizado',
                  'El confirmación ha sido actualizado correctamente',
                  'success'
                );
                this.fetchConfirmations();
                this.closeEditModal();
              },
              (error) => {
                Swal.fire(
                  'Error',
                  'No se pudo actualizar el confirmación',
                  'error'
                );
              }
            );
        }
      });
    }
  }

  changeStatus(confirmation: Confirmation): void {
    this.selectedConfirmationForStatusChange = confirmation;
    this.newRequestStatus = confirmation.requestStatus;
  }

  closeStatusChangeModal(): void {
    this.selectedConfirmationForStatusChange = null;
  }

  setStatus(status: string): void {
    this.newRequestStatus = status;
    this.updateRequestStatus();
  }

  updateRequestStatus(): void {
    if (this.selectedConfirmationForStatusChange && this.newRequestStatus) {
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
          const id = this.selectedConfirmationForStatusChange?.id;
          if (id) {
            this.confirmationService
              .updateRequestStatus(id, this.newRequestStatus)
              .subscribe(
                () => {
                  Swal.fire(
                    'Actualizado',
                    'El estado de la solicitud ha sido actualizado',
                    'success'
                  );
                  this.fetchConfirmations();
                  this.closeStatusChangeModal();
                },
                (error) => {
                  Swal.fire(
                    'Error',
                    'No se pudo actualizar el estado de la solicitud',
                    'error'
                  );
                }
              );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire(
            'Cancelado',
            'No hubo cambios en el estado de la solicitud',
            'info'
          );
        }
      });
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'P':
        return 'Pendiente';
      case 'A':
        return 'Aprobado';
      case 'D':
        return 'Desaprobado';
      default:
        return 'Desconocido';
    }
  }

  getStatusColorClass(status: string): string {
    switch (status) {
      case 'P':
        return 'bg-yellow-500 text-white';
      case 'A':
        return 'bg-green-500 text-white';
      case 'D':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  }

  adjustDateToLocal(date: Date): Date {
    const adjustedDate = new Date(date);
    adjustedDate.setMinutes(
      adjustedDate.getMinutes() + adjustedDate.getTimezoneOffset()
    );
    return adjustedDate;
  }

  updateDisplayedConfirmations(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedConfirmations = this.filteredConfirmations.slice(
      startIndex,
      endIndex
    );
  }

  nextPage(): void {
    if (this.currentPage * this.itemsPerPage < this.totalItems) {
      this.currentPage++;
      this.updateDisplayedConfirmations();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedConfirmations();
    }
  }
}
