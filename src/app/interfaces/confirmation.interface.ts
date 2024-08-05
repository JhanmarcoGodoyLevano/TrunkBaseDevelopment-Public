export interface Confirmation {
  id: string;
  names: string;
  lastName: string;
  birthDate: string | null;
  applicantId: string | null;
  storageId: string | null;
  paymentStatus: string;
  comment: string;
  catechesis: string;
  bishop: string;
  confirmationPlace: string;
  confirmationDate: string | null;
  requestStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateConfirmation {
  names: string;
  lastName: string;
  birthDate: string | null;
}
