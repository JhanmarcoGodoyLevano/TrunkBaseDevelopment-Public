export interface User {
  id: string
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'admin';
  privilege?: string;
  phoneNumber?: string
}
