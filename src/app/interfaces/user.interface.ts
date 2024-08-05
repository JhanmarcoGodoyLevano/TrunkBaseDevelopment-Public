export interface User {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'admin';
  privilege?: string;
}
