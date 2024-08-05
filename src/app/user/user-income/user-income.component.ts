import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { IncomeCategory, IncomeCategoryService } from 'src/app/services/categoryIncome.service';
import { IncomeService } from 'src/app/services/income.service';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import { Income } from 'src/app/interfaces/income.interface';
import { User } from 'src/app/interfaces/user.interface';
import { Concept } from 'src/app/interfaces/concept.interface';

@Component({
  selector: 'app-user-income',
  templateUrl: './user-income.component.html',
  styleUrls: ['./user-income.component.css']
})
export class UserIncomeComponent implements OnInit {
  selectedCategories: string[] = ['']; 
  selectedFiles: string[] = [];
  categories: IncomeCategory[] = [];
  totalAmount: number = 0;
  phoneNumber: string = '';
  dateEvent: string = ''; 
  minDateTime: string = '';
  maxDateTime: string = '';
  isPhoneValid: boolean = true;
  isProcessing: boolean = false;
  userIncomes: Income[] = [];
  filteredIncomes: Income[] = [];
  currentUser: User | null = null;
  showModal: boolean = false;
  searchTerm: string = '';
  selectedImageUrl: string | null = null; // Variable para almacenar la URL de la imagen seleccionada

  @ViewChild('expenseForm') expenseForm!: NgForm;

  constructor(
    private accountingService: IncomeService,
    private authService: AuthService,
    private incomeCategoryService: IncomeCategoryService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.setDateTimeLimits();
    this.authService.user$.subscribe((user: User | null) => {
      if (user) {
        this.currentUser = user;
        this.loadUserIncomes();
      } else {
        console.error('No user currently logged in.');
      }
    });
  }

  loadCategories() {
    this.incomeCategoryService.getAllCategories().subscribe(
      (data: IncomeCategory[]) => {
        this.categories = data;
      },
      (error: any) => {
        console.error('Error fetching categories:', error);
      }
    );
  }

  setDateTimeLimits() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const nextDay = String(today.getDate() + 1).padStart(2, '0');

    this.minDateTime = `${year}-${month}-${nextDay}T00:00`;
    this.maxDateTime = `${year}-12-31T23:59`;
  }

  validatePhone() {
    const phonePattern = /^9\d{8}$/;
    this.isPhoneValid = phonePattern.test(this.phoneNumber);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = [];
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.selectedFiles.push(e.target.result);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }

  addCategory() {
    if (this.selectedCategories.length < 3) {
      this.selectedCategories.push('');
    }
  }

  removeCategory(index: number) {
    if (this.selectedCategories.length > 1) {
      this.selectedCategories.splice(index, 1);
    }
    this.updateTotalAmount();
  }

  updateTotalAmount() {
    this.totalAmount = this.selectedCategories.reduce((total, categoryId) => {
      const category = this.categories.find(cat => cat.categoryId === categoryId);
      return total + (category ? category.amount : 0);
    }, 0);
  }

  createExpense() {
    if (!this.isPhoneValid) {
      Swal.fire('Error!', 'El número de teléfono es inválido.', 'error');
      return;
    }

    this.isProcessing = true;

    const formDataObj = new FormData();

    this.selectedCategories.forEach((categoryId, index) => {
      if (categoryId) {
        formDataObj.append('categories', categoryId);
      }
    });

    formDataObj.append('phoneNumber', this.phoneNumber);
    formDataObj.append('dateEvent', this.dateEvent);
    formDataObj.append('type', 'I');

    const inputFiles = (document.getElementById('files') as HTMLInputElement).files;
    if (inputFiles) {
      for (let i = 0; i < inputFiles.length; i++) {
        formDataObj.append('files', inputFiles[i], inputFiles[i].name);
      }
    }

    this.authService.user$.subscribe(
      (currentUser) => {
        if (currentUser) {
          formDataObj.append('personId', currentUser.id);
          formDataObj.append('statusPayment', 'P');

          this.accountingService.createAccounting(formDataObj).subscribe(
            (response: any) => {
              console.log('Expense created successfully:', response);
              Swal.fire(
                'Creado!',
                'El registro ha sido creado exitosamente.',
                'success'
              );
              this.resetForm();
              this.loadUserIncomes();
            },
            (error: HttpErrorResponse) => {
              console.error('Error creating expense:', error);
              Swal.fire(
                'Error!',
                'Hubo un error al crear el registro.',
                'error'
              );
            }
          );
        } else {
          console.error('No user currently logged in.');
        }
      },
      (error: any) => {
        console.error('Error getting current user:', error);
      }
    );
  }

  loadUserIncomes() {
    if (!this.currentUser) return;

    this.accountingService.getAllAccounting().subscribe(
      (data: Income[]) => {
        this.userIncomes = data.filter(income => income.personId === this.currentUser!.id);
        this.filteredIncomes = [...this.userIncomes];
      },
      (error: any) => {
        console.error('Error fetching user incomes:', error);
      }
    );
  }

  resetForm() {
    this.expenseForm.resetForm();
    this.selectedFiles = [];
    this.selectedCategories = [''];
    this.phoneNumber = '';
    this.dateEvent = '';
    this.totalAmount = 0;
    this.isPhoneValid = true;
    this.isProcessing = false;

    const fileInput = document.getElementById('files') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  getTotalForRecord(record: Income): number {
    return record.categories.reduce((total, category) => total + category.amount, 0);
  }

  // Obtener nombres de las categorías en un solo string
  getCategoryNames(categories: Concept[]): string {
    return categories.map(cat => cat.name).join(', ');
  }

  // Métodos para controlar el modal
  openIncomeModal() {
    this.showModal = true;
  }

  closeIncomeModal() {
    this.showModal = false;
  }

  // Método para filtrar los ingresos por término de búsqueda
  filterIncomes() {
    const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
    this.filteredIncomes = this.userIncomes.filter(income =>
      income.categories.some(category =>
        category.name.toLowerCase().includes(lowerCaseSearchTerm)
      )
    );
  }

  // Método para abrir la imagen en grande
  openImage(url: string) {
    this.selectedImageUrl = url;
  }

  closeImage() {
    this.selectedImageUrl = null;
  }
}
