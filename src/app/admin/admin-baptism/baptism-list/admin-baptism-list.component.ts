import { Component, OnInit, HostListener } from '@angular/core';
import { BaptismService } from 'src/app/services/baptism.service';
import { Baptism } from 'src/app/interfaces/baptism.interface';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-admin-baptism-list',
  templateUrl: './admin-baptism-list.component.html',
  styleUrls: ['./admin-baptism-list.component.css'],
})
export class AdminBaptismListComponent implements OnInit {
  baptisms: Baptism[] = [];
  filteredBaptisms: Baptism[] = [];
  displayedBaptisms: Baptism[] = [];
  requestStatus: string = 'P';
  selectedBaptism: string = '';
  selectedBaptismForView: Baptism | null = null;
  selectedBaptismForStatusChange: Baptism | null = null;
  newRequestStatus: string = '';
  baptismToEdit: Baptism | null = null;
  currentPage: number = 1;
  itemsPerPage: number = 4;
  totalItems: number = 0;
  menuVisible: boolean = false;
  selectedCatechesis: string = '';
  catechesisOptions: string[] = ['', '1 vez', '2 veces', '3 veces'];
  selectedPreparationTalk: string = '';
  preparationTalkOptions: string[] = [
    '',
    '1 vez',
    '2 veces',
    '3 veces',
    '4 veces',
    '5 veces',
  ];

  constructor(private baptismService: BaptismService) {}

  ngOnInit(): void {
    this.fetchBaptisms();
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

  fetchBaptisms(): void {
    switch (this.requestStatus) {
      case 'P':
        this.baptismService.getPendingBaptisms().subscribe(
          (data: Baptism[]) => {
            this.baptisms = data;
            this.totalItems = data.length;
            this.filterBaptisms();
          },
          (error) => {
            console.error('Error al obtener bautismos pendientes', error);
          }
        );
        break;
      case 'A':
        this.baptismService.getAcceptedBaptisms().subscribe(
          (data: Baptism[]) => {
            this.baptisms = data;
            this.totalItems = data.length;
            this.filterBaptisms();
          },
          (error) => {
            console.error('Error al obtener bautismos aceptados', error);
          }
        );
        break;
      case 'R':
        this.baptismService.getRejectedBaptisms().subscribe(
          (data: Baptism[]) => {
            this.baptisms = data;
            this.totalItems = data.length;
            this.filterBaptisms();
          },
          (error) => {
            console.error('Error al obtener bautismos rechazados', error);
          }
        );
        break;
      default:
        console.error('Estado de solicitud inválido');
    }
  }

  onSearchSelectChange(): void {
    this.currentPage = 1;
    this.filterBaptisms();
  }

  filterBaptisms(): void {
    if (this.selectedBaptism) {
      this.filteredBaptisms = this.baptisms.filter(
        (baptism) => baptism.idBaptism === this.selectedBaptism
      );
    } else {
      this.filteredBaptisms = this.baptisms;
    }

    this.filteredBaptisms = this.filteredBaptisms.map((baptism) => ({
      ...baptism,
      baptismDate: baptism.baptismDate
        ? this.adjustDateToLocal(new Date(baptism.baptismDate))
            .toISOString()
            .split('T')[0]
        : null,
      birthDate: baptism.birthDate
        ? this.adjustDateToLocal(new Date(baptism.birthDate))
            .toISOString()
            .split('T')[0]
        : null,
    }));

    this.updateDisplayedBaptisms();
  }

  onDownloadExcel(): void {
    const exportData = this.filteredBaptisms.map((baptism) => ({
      Nombre: baptism.names,
      Apellido: baptism.lastName,
      FechaNacimiento: baptism.baptismDate,
      // Agrega más campos según tus necesidades
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const wb: XLSX.WorkBook = { Sheets: { data: ws }, SheetNames: ['data'] };
    XLSX.writeFile(wb, 'bautismos.xlsx');
  }

  onDownloadCSV(): void {
    const exportData = this.filteredBaptisms.map((baptism) => ({
      Nombre: baptism.names,
      Apellido: baptism.lastName,
      FechaNacimiento: baptism.baptismDate,
      // Agrega más campos según tus necesidades
    }));

    const csvData = this.convertToCSV(exportData);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'bautismos.csv');
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
    this.selectedBaptism = '';
    this.currentPage = 1;
    this.fetchBaptisms();
  }

  viewDetails(baptism: Baptism): void {
    this.selectedBaptismForView = baptism;
  }

  closeViewModal(): void {
    this.selectedBaptismForView = null;
  }

  editBaptism(baptism: Baptism): void {
    this.baptismToEdit = { ...baptism };
    this.baptismToEdit.baptismDate = baptism.baptismDate
      ? new Date(baptism.baptismDate).toISOString().split('T')[0]
      : null;
    this.baptismToEdit.birthDate = baptism.birthDate
      ? new Date(baptism.birthDate).toISOString().split('T')[0]
      : null;
    this.selectedCatechesis = baptism.catechesis || this.catechesisOptions[0];
    this.selectedPreparationTalk =
      baptism.preparationTalk || this.preparationTalkOptions[0];
  }

  closeEditModal(): void {
    this.baptismToEdit = null;
  }

  saveBaptism(): void {
    if (this.baptismToEdit) {
      const originalBaptism = this.baptisms.find(
        (b) => b.idBaptism === this.baptismToEdit!.idBaptism
      );

      if (!originalBaptism) {
        console.error('No se encontró el bautismo original');
        Swal.fire('Error', 'No se encontró el bautismo original', 'error');
        return;
      }

      const changesMade =
        this.baptismToEdit.catechesis !== originalBaptism.catechesis ||
        this.baptismToEdit.preparationTalk !==
          originalBaptism.preparationTalk ||
        this.baptismToEdit.paymentStatus !== originalBaptism.paymentStatus ||
        this.baptismToEdit.baptismDate !== originalBaptism.baptismDate ||
        this.baptismToEdit.baptismPlace !== originalBaptism.baptismPlace ||
        this.baptismToEdit.comment !== originalBaptism.comment;

      if (!changesMade) {
        Swal.fire('Sin cambios', 'No hubo cambios para actualizar', 'info');
        return;
      }

      Swal.fire({
        title: '¿Estás seguro?',
        text: '¿Deseas actualizar el bautismo?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, actualizar',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          this.baptismToEdit!.catechesis = this.selectedCatechesis;
          this.baptismToEdit!.preparationTalk = this.selectedPreparationTalk;

          this.baptismService.updateBaptism(this.baptismToEdit!).subscribe(
            (updatedBaptism: Baptism) => {
              Swal.fire(
                'Actualizado',
                'El bautismo ha sido actualizado correctamente',
                'success'
              );
              this.fetchBaptisms();
              this.closeEditModal();
            },
            (error) => {
              Swal.fire('Error', 'No se pudo actualizar el bautismo', 'error');
            }
          );
        }
      });
    }
  }

  changeStatus(baptism: Baptism): void {
    this.selectedBaptismForStatusChange = baptism;
    this.newRequestStatus = baptism.requestStatus;
  }

  closeStatusChangeModal(): void {
    this.selectedBaptismForStatusChange = null;
  }

  setStatus(status: string): void {
    this.newRequestStatus = status;
    this.updateRequestStatus();
  }

  updateRequestStatus(): void {
    if (this.selectedBaptismForStatusChange && this.newRequestStatus) {
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
          const idBaptism = this.selectedBaptismForStatusChange?.idBaptism;
          if (idBaptism) {
            this.baptismService
              .updateRequestStatus(idBaptism, this.newRequestStatus)
              .subscribe(
                () => {
                  Swal.fire(
                    'Actualizado',
                    'El estado de la solicitud ha sido actualizado',
                    'success'
                  );
                  this.fetchBaptisms();
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

  updateDisplayedBaptisms(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedBaptisms = this.filteredBaptisms.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if (this.currentPage * this.itemsPerPage < this.totalItems) {
      this.currentPage++;
      this.updateDisplayedBaptisms();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedBaptisms();
    }
  }
}
