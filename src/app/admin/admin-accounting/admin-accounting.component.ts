import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Income } from 'src/app/interfaces/income.interface';
import { User } from 'src/app/interfaces/user.interface';
import { AuthService } from 'src/app/services/auth.service';
import { IncomeService } from 'src/app/services/income.service';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import autoTable from 'jspdf-autotable';


@Component({
  selector: 'app-admin-accounting',
  templateUrl: './admin-accounting.component.html',
  styleUrls: ['./admin-accounting.component.css'],
})
export class AdminAccountingComponent implements OnInit {
  accountingRecords: Income[] = [];
  activeRecords: Income[] = [];
  sentRecords: Income[] = []; // Registros que ya han sido enviados
  filteredSentRecords: Income[] = [];
  users: User[] = [];
  totalAmount: number = 0;
  selectedRecord: Income | null = null;
  isCreateAccountingModalOpen: boolean = false;
  isDetailModalOpen: boolean = false; // Estado para el modal de detalles
  isPaymentStatusModalOpen: boolean = false;
  isSentRecordsModalOpen: boolean = false; // Estado para el modal de registros enviados
  comments: string = '';
  currentUserId: string = ''; // Variable para almacenar el ID del usuario actual
  showActiveRecords: boolean = true; // Variable para alternar la vista

  // Variables para filtros
  searchTerm: string = '';
  filterAccepted: boolean = false;
  filterRejected: boolean = false;
  dateFilter: string = '';

  constructor(
    private accountingService: IncomeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAccountingRecords();
    this.loadUsers();
    this.authService.user$.subscribe(user => {
      if (user) {
        this.currentUserId = user.id; // Asigna el ID del usuario actual
      }
    });
  }

  loadAccountingRecords() {
    this.accountingService.getAllAccounting().subscribe(
      (data: Income[]) => {
        console.log('Accounting Records:', data);
        this.accountingRecords = data.sort(
          (a, b) => new Date(b.dateEvent).getTime() - new Date(a.dateEvent).getTime()
        ).map(record => ({
          ...record,
          isLoading: false,
          isSent: false,
          statusMessage: ''
        }));

        this.activeRecords = this.accountingRecords.filter(
          record => record.statusPayment === 'P'
        );
        this.sentRecords = this.accountingRecords.filter(
          record => record.statusPayment === 'A' || record.statusPayment === 'R'
        );
        this.filteredSentRecords = [...this.sentRecords];
        this.applySentRecordsFilter(); // Asegúrate de aplicar filtros inicialmente
        this.calculateTotalAmount();
      },
      (error: any) => {
        console.error('Error fetching accounting records:', error);
      }
    );
  }

  loadUsers() {
    this.authService.getAllUsers().subscribe(
      (users: User[]) => {
        this.users = users;
      },
      (error: any) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  getUserName(id: string): User | undefined {
    return this.users.find(user => user.id === id);
  }

  calculateTotalAmount() {
    this.totalAmount = this.accountingRecords.reduce((total, record) => {
      return total + this.getTotalForRecord(record);
    }, 0);
  }

  getTotalForRecord(record: Income): number {
    return record.categories.reduce((sum, category) => sum + category.amount, 0);
  }

  toggleRecordView() {
    this.showActiveRecords = !this.showActiveRecords;
  }

  openCreateAccountingModal() {
    this.isCreateAccountingModalOpen = true;
  }

  closeCreateAccountingModal() {
    this.isCreateAccountingModalOpen = false;
  }

  openEditAccountingModal(record: Income) {
    this.selectedRecord = record;
    this.isCreateAccountingModalOpen = true;
  }

  closeDetailModal() {
    this.isDetailModalOpen = false;
    this.selectedRecord = null;
  }

  openDetailModal(record: Income) {
    this.selectedRecord = record;
    this.isDetailModalOpen = true;
  }

  openPaymentStatusModal(record: Income) {
    this.selectedRecord = record;
    this.isPaymentStatusModalOpen = true;
  }

  closePaymentStatusModal() {
    this.isPaymentStatusModalOpen = false;
  }

  openSentRecordsModal() {
    this.isSentRecordsModalOpen = true;
    this.applySentRecordsFilter(); // Aplicar filtros al abrir el modal
  }

  closeSentRecordsModal() {
    this.isSentRecordsModalOpen = false;
  }

  acceptPayment() {
    if (this.selectedRecord) {
      const partialUpdate = {
        statusPayment: 'A',
        comment: this.comments,
        personConfirmedId: this.currentUserId,
        statusNotification: true
      };

      this.startLoading(this.selectedRecord); // Iniciar carga
      this.updatePaymentStatus(this.selectedRecord.incomeId, partialUpdate);

      this.comments = '';
    }
  }

  rejectPayment() {
    if (this.selectedRecord) {
      const partialUpdate = {
        statusPayment: 'R',
        comment: this.comments,
        personConfirmedId: this.currentUserId,
        statusNotification: true
      };

      this.startLoading(this.selectedRecord); // Iniciar carga
      this.updatePaymentStatus(this.selectedRecord.incomeId, partialUpdate);

      this.comments = '';
    }
  }

  startLoading(record: Income) {
    // Iniciar con el mensaje "Enviando..."
    record.isLoading = true;
    record.isSent = false;
    record.statusMessage = 'Enviando...';

    // Simula el proceso de envío del correo (por ejemplo, 2 segundos)
    setTimeout(() => {
      // Cambiar el estado a "Enviado"
      record.statusMessage = 'Enviado';
      record.isLoading = false;
      record.isSent = true;

      // Cambiar el estado a "Guardando" y luego eliminar el registro después de 3 segundos
      setTimeout(() => {
        record.statusMessage = 'Guardando';

        // Esperar 3 segundos antes de mover el registro
        setTimeout(() => {
          this.moveToSentRecords(record);
        }, 3000);
      }, 2000); // Tiempo entre "Enviado" y "Guardando"
    }, 2000); // Tiempo simulado para "Enviando..."
  }

  moveToSentRecords(record: Income) {
    const index = this.activeRecords.indexOf(record);
    if (index !== -1) {
      this.activeRecords.splice(index, 1); // Eliminar de los activos
      this.sentRecords.push(record); // Añadir a los enviados
    }
  }

  updatePaymentStatus(id: string, partialUpdate: Partial<Income>) {
    this.closePaymentStatusModal(); // Cierra el modal inmediatamente
    this.accountingService.patchAccounting(id, partialUpdate).subscribe(
      () => {
        this.loadAccountingRecords(); // Actualiza la lista de registros
        console.log('El estado de pago ha sido actualizado.'); // Log simple
      },
      (error) => {
        console.error('Error al actualizar el estado de pago:', error);
      }
    );
  }

  deleteAccounting(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este registro?')) {
      this.accountingService.inactivateAccounting(id).subscribe(
        () => {
          console.log('El registro ha sido eliminado.');
          this.loadAccountingRecords();
        },
        (error: HttpErrorResponse) => {
          console.error('Error inactivating accounting record:', error);
        }
      );
    }
  }

  reactivateAccounting(id: string) {
    if (confirm('¿Estás seguro de que deseas reactivar este registro?')) {
      this.accountingService.activateAccounting(id).subscribe(
        () => {
          console.log('El registro ha sido reactivado.');
          this.loadAccountingRecords();
        },
        (error: HttpErrorResponse) => {
          console.error('Error reactivating accounting record:', error);
        }
      );
    }
  }

  createAccounting(form: HTMLFormElement) {
    const formData = new FormData(form);
    
    this.accountingService.createAccounting(formData).subscribe(
      (response: Income) => {
        console.log('Accounting record created successfully:', response);
        this.closeCreateAccountingModal();
        this.loadAccountingRecords();
        console.log('El registro ha sido creado exitosamente.');
      },
      (error: HttpErrorResponse) => {
        console.error('Error creating accounting record:', error);
      }
    );
  }

  // Filtrar registros enviados en el modal
  applySentRecordsFilter() {
    this.filteredSentRecords = this.sentRecords.filter((record) => {
      const user = this.getUserName(record.personId);
      
      // Convertimos todo el registro a una cadena de texto para facilitar la búsqueda global
      const recordString = JSON.stringify({
        userFirstName: user?.firstName || '',
        userLastName: user?.lastName || '',
        userEmail: user?.email || '',
        categories: record.categories.map(category => category.name).join(' '),
        amounts: record.categories.map(category => category.amount.toFixed(2)).join(' ')
      }).toLowerCase();

      const matchesSearchTerm = !this.searchTerm || recordString.includes(this.searchTerm.toLowerCase());

      const matchesAccepted = !this.filterAccepted || record.statusPayment === 'A';
      const matchesRejected = !this.filterRejected || record.statusPayment === 'R';
      const matchesDate = this.filterByDate(record);

      return matchesSearchTerm && matchesAccepted && matchesRejected && matchesDate;
    });
}


  filterByDate(record: Income): boolean {
    if (!this.dateFilter) return true;

    const today = new Date();
    const recordDate = new Date(record.dateEvent);

    switch (this.dateFilter) {
      case 'today':
        return (
          recordDate.getDate() === today.getDate() &&
          recordDate.getMonth() === today.getMonth() &&
          recordDate.getFullYear() === today.getFullYear()
        );
      case 'week':
        const oneWeekAgo = new Date(today.setDate(today.getDate() - 7));
        return recordDate >= oneWeekAgo;
      case 'month':
        const oneMonthAgo = new Date(today.setMonth(today.getMonth() - 1));
        return recordDate >= oneMonthAgo;
      default:
        return true;
    }
  }
// Agregar una nueva variable para la paginación
page: number = 1;

  // Agregar nueva variable para búsqueda
tableSearchTerm: string = '';

// Agregar lógica de filtrado
get filteredTableRecords() {
  return this.activeRecords.filter((record) => {
    const user = this.getUserName(record.personId);
    
    // Convertimos todo el registro a una cadena de texto para facilitar la búsqueda global
    const recordString = JSON.stringify({
      userFirstName: user?.firstName || '',
      userLastName: user?.lastName || '',
      userEmail: user?.email || '',
      categories: record.categories.map(category => category.name).join(' '),
      amounts: record.categories.map(category => category.amount.toFixed(2)).join(' ')
    }).toLowerCase();

    return !this.tableSearchTerm || recordString.includes(this.tableSearchTerm.toLowerCase());
  });
}

//EXPORTACIONES DE LA TABLA

exportToPDF() {
  console.log('Exporting to PDF');

  if (!this.filteredTableRecords || this.filteredTableRecords.length === 0) {
    console.error('No table records available.');
    return;
  }

  const doc = new jsPDF('landscape');

  // Color de la cabecera
  doc.setFillColor(88, 7, 7); // Fondo rojo granate
  doc.rect(0, 0, doc.internal.pageSize.width, 60, 'F'); // Rectángulo para toda la cabecera

  // Agregar imagen a la izquierda de la cabecera
  const logoLeft = 'assets/logo-parroquia.png';
  const logoSize = 30; // Tamaño de la imagen
  doc.addImage(logoLeft, 'PNG', 10, 15, logoSize, logoSize); // Ajustar dimensiones y posición

  // Agregar imagen a la derecha de la cabecera
  const logoRight = 'assets/income-icon.png';
  const logoRightWidth = 40;
  const logoRightHeight = 40;
  const logoRightX = doc.internal.pageSize.width - logoRightWidth - 10;
  const logoRightY = 10;
  doc.addImage(logoRight, 'PNG', logoRightX, logoRightY, logoRightWidth, logoRightHeight);

  // Agregar título en medio de la cabecera
  doc.setTextColor(255, 255, 255); // Texto blanco
  doc.setFontSize(26); // Tamaño del título
  doc.setFont("helvetica", "bold"); // Fuente en negrita
  const title = 'Listado de Ingresos';
  const titleX = (doc.internal.pageSize.width - doc.getTextWidth(title)) / 2;
  const titleY = 35;
  doc.text(title, titleX, titleY);

  const columns = [
    ['Usuario', 'Conceptos', 'Montos', 'Tipo', 'Estado de Pago', 'Estado de Envío'],
  ];

  const data = this.filteredTableRecords.map(record => [
    `${this.getUserName(record.personId)?.firstName || ''} ${this.getUserName(record.personId)?.lastName || ''}`,
    record.categories.map(c => c.name).join(', '),
    'S/ ' + this.getTotalForRecord(record).toFixed(2),
    record.type === 'I' ? 'Ingreso' : 'Egreso',
    record.statusPayment === 'P' ? 'Pendiente' : (record.statusPayment === 'R' ? 'Rechazado' : 'Aceptado'),
    record.isSent ? 'Enviado' : 'No Enviado'
  ]);

  const separationSpace = 50;
  const startY = titleY + separationSpace;

  autoTable(doc, {
    head: columns,
    body: data,
    startY: startY,
    tableWidth: 'auto',
    styles: {
      textColor: [0, 0, 0],
      fontSize: 10,
    },
    headStyles: {
      fillColor: [255, 193, 7], // Color mostaza para la cabecera de la tabla
      textColor: [0, 0, 0],
    },
    theme: 'striped', // Tema con bandas
  });

  // Pie de página
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.height;
    doc.setFillColor(88, 7, 7); // Mismo color que la cabecera
    doc.rect(0, pageHeight - 20, doc.internal.pageSize.width, 20, 'F'); // Barra de pie de página
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('Parroquia San Vicente Mártir', 10, pageHeight - 7);
    doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 40, pageHeight - 7);
  }

  doc.save('ingresos.pdf');
}









exportToExcel() {
  const tableElement = document.querySelector('table'); // Selecciona la tabla en el DOM
  if (!tableElement) {
    console.error('No table element found.');
    return;
  }

  const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(tableElement);
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Ingresos');
  XLSX.writeFile(wb, 'ingresos.xlsx');
}

exportToCSV() {
  const header = ['Usuario', 'Conceptos', 'Montos', 'Tipo', 'Estado de Pago', 'Estado de Envío'];
  const data = this.filteredTableRecords.map(record => [
    `${this.getUserName(record.personId)?.firstName || ''} ${this.getUserName(record.personId)?.lastName || ''}`,
    record.categories.map(c => c.name).join(', '),
    'S/ ' + this.getTotalForRecord(record).toFixed(2),
    record.type === 'I' ? 'Ingreso' : 'Egreso',
    record.statusPayment === 'P' ? 'Pendiente' : (record.statusPayment === 'R' ? 'Rechazado' : 'Aceptado'),
    record.isSent ? 'Enviado' : 'No Enviado'
  ]);

  const csv = [header, ...data].map(row => row.join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ingresos.csv';
  a.click();
  window.URL.revokeObjectURL(url);
}


//--------------------------------------------------------

//MODAL DE EXPORTACION DE LA TABLA--------------
isExportModalOpen: boolean = false;

openExportModal() {
  this.isExportModalOpen = true;
}

closeExportModal() {
  this.isExportModalOpen = false;
}
//-----------------------------------------------



//MODAL PARA EXPORTAR REGISTROS ENVIADOS

// Variables de estado
isExportSentModalOpen: boolean = false;

// Métodos para abrir y cerrar el modal
openExportSentModal() {
  this.isExportSentModalOpen = true;
}

closeExportSentModal() {
  this.isExportSentModalOpen = false;
}

// Métodos de exportación para los datos del modal de Registros Enviados
exportSentToPDF() {
  console.log('Exporting Sent Records to PDF');

  if (!this.filteredSentRecords || this.filteredSentRecords.length === 0) {
    console.error('No sent records available.');
    return;
  }

  const doc = new jsPDF('landscape');

  // Color de la cabecera
  doc.setFillColor(88, 7, 7); // Fondo rojo granate
  doc.rect(0, 0, doc.internal.pageSize.width, 60, 'F'); // Rectángulo para toda la cabecera

  // Agregar imagen a la izquierda de la cabecera
  const logoLeft = 'assets/logo-parroquia.png';
  const logoSize = 30;
  doc.addImage(logoLeft, 'PNG', 10, 15, logoSize, logoSize);

  // Agregar imagen a la derecha de la cabecera
  const logoRight = 'assets/income-icon.png';
  const logoRightWidth = 40;
  const logoRightHeight = 40;
  const logoRightX = doc.internal.pageSize.width - logoRightWidth - 10;
  const logoRightY = 10;
  doc.addImage(logoRight, 'PNG', logoRightX, logoRightY, logoRightWidth, logoRightHeight);

  // Agregar título en medio de la cabecera
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  const title = 'Registros Enviados';
  const titleX = (doc.internal.pageSize.width - doc.getTextWidth(title)) / 2;
  const titleY = 35;
  doc.text(title, titleX, titleY);

  const columns = [
    ['Usuario', 'Conceptos', 'Montos', 'Tipo', 'Estado de Pago'],
  ];

  const data = this.filteredSentRecords.map(record => [
    `${this.getUserName(record.personId)?.firstName || ''} ${this.getUserName(record.personId)?.lastName || ''}`,
    record.categories.map(c => c.name).join(', '),
    'S/ ' + this.getTotalForRecord(record).toFixed(2),
    record.type === 'I' ? 'Ingreso' : 'Egreso',
    record.statusPayment === 'R' ? 'Rechazado' : 'Aceptado',
  ]);

  const separationSpace = 50;
  const startY = titleY + separationSpace;

  autoTable(doc, {
    head: columns,
    body: data,
    startY: startY,
    tableWidth: 'auto',
    styles: {
      textColor: [0, 0, 0],
      fontSize: 10,
    },
    headStyles: {
      fillColor: [255, 193, 7],
      textColor: [0, 0, 0],
    },
    theme: 'striped',
  });

  // Pie de página
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.height;
    doc.setFillColor(88, 7, 7);
    doc.rect(0, pageHeight - 20, doc.internal.pageSize.width, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('Parroquia San Vicente Mártir', 10, pageHeight - 7);
    doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 40, pageHeight - 7);
  }

  doc.save('registros_enviados.pdf');
}

exportSentToExcel() {
  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.filteredSentRecords.map(record => ({
    Usuario: `${this.getUserName(record.personId)?.firstName || ''} ${this.getUserName(record.personId)?.lastName || ''}`,
    Conceptos: record.categories.map(c => c.name).join(', '),
    Montos: 'S/ ' + this.getTotalForRecord(record).toFixed(2),
    Tipo: record.type === 'I' ? 'Ingreso' : 'Egreso',
    Estado: record.statusPayment === 'R' ? 'Rechazado' : 'Aceptado',
  })));
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Registros Enviados');
  XLSX.writeFile(wb, 'registros_enviados.xlsx');
}

exportSentToCSV() {
  const header = ['Usuario', 'Conceptos', 'Montos', 'Tipo', 'Estado de Pago'];
  const data = this.filteredSentRecords.map(record => [
    `${this.getUserName(record.personId)?.firstName || ''} ${this.getUserName(record.personId)?.lastName || ''}`,
    record.categories.map(c => c.name).join(', '),
    'S/ ' + this.getTotalForRecord(record).toFixed(2),
    record.type === 'I' ? 'Ingreso' : 'Egreso',
    record.statusPayment === 'R' ? 'Rechazado' : 'Aceptado',
  ]);

  const csv = [header, ...data].map(row => row.join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'registros_enviados.csv';
  a.click();
  window.URL.revokeObjectURL(url);
}


}
