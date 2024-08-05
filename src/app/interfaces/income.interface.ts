import { Concept } from './concept.interface';

export interface Income {
  incomeId: string;
  personId: string;
  celebrantId: string;
  dateEvent: Date;
  fileUrls?: string[];
  categories: Concept[]; // Cambiado a un array de Concept
  type: string;
  personConfirmedId?: string;
  phoneNumber: string;
  statusPayment: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  isLoading?: boolean;
  isSent?: boolean;
  statusMessage?: string; // Agrega esta línea

}
