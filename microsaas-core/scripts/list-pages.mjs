import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function listPages() {
  const { data, error } = await supabaseAdmin
    .from('pages')
    .select('*');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Pages in database:');
  console.log(JSON.stringify(data, null, 2));
}

listPages();
