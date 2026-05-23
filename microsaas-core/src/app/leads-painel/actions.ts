'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type Lead = {
  id: string;
  nome: string;
  email: string;
  origem: string;
  status: string;
  created_at: string;
};

export async function getLeads(): Promise<Lead[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as unknown as Lead[];
  } catch (error) {
    console.error('Error fetching leads:', error);
    throw error;
  }
}

export async function promoteLeadToUser(lead: Lead) {
  try {
    // 1. Check if user already exists in profiles
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', lead.email)
      .single();

    if (existingProfile) {
      return { success: true, message: 'Usuário já existe no sistema.', redirect: '/estudio-lab/usuarios' };
    }

    // 2. Create Auth User (Admin can create users)
    // Note: We use a random password, user will need to reset it or we can send an invite.
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: lead.email,
      password: Buffer.from(Math.random().toString()).toString('base64').substring(0, 12),
      email_confirm: true,
    });

    if (authError) {
      // If user already exists in auth.users but not in profiles
      if (authError.message.includes('already registered')) {
        // Continue to profile creation
      } else {
        throw authError;
      }
    }

    const userId = authUser?.user?.id || (await getUserIdByEmail(lead.email));
    
    if (!userId) {
      throw new Error('Não foi possível identificar o ID do usuário.');
    }

     // 3. Create Profile
     const { error: profileError } = await supabaseAdmin
       .from('profiles')
       .insert({
         id: userId,
         name: lead.nome,
         email: lead.email,
         role: 'viewer', // Default role
         is_active: true,
       });

     if (profileError) throw profileError;

     // 4. Create initial package access (Trial 30 days)
     const { error: packageError } = await supabaseAdmin
       .from('user_package_access')
       .insert({
         user_id: userId,
         package_code: 'trial_30_days',
         plan_slug: 'trial-30-days',
         plan_name: 'Teste grátis de 30 dias',
         status: 'active',
         source: 'promotion',
         starts_at: new Date().toISOString(),
       });

     if (packageError) {
       console.error('Error creating package access:', packageError);
       // We don't throw here because the user is already created and profile is created.
       // It's better to have a user without a package than to fail the whole promotion.
     }

     revalidatePath('/myuser');
     revalidatePath('/estudio-lab/usuarios');

     return { 
       success: true, 
       message: 'Lead promovido a usuário com sucesso!',
       redirect: '/estudio-lab/usuarios' 
     };


  } catch (error) {
    console.error('Error promoting lead:', error);
    throw error;
  }
}

async function getUserIdByEmail(email: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();
  
  if (error) return null;
  return data?.id || null;
}
