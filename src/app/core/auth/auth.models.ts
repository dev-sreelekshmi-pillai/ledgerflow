import { User } from '@angular/fire/auth';

export interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
}
