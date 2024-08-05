export interface Baptism {
  idBaptism: string;
  names: string;
  lastName: string;
  birthDate: string | null;
  personId: string | null;
  storageId: string | null;
  paymentStatus: string;
  comment: string;
  catechesis: string;
  preparationTalk: string;
  baptismPlace: string;
  baptismDate: string | null;
  requestStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBaptism {
  names: string;
  lastName: string;
  birthDate: string;
}
