import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const supabaseService = inject(SupabaseService);

  const { data, error } = await supabaseService.getSession();

  if (data.session) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
