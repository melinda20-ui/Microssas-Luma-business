import { createClient } from '@supabase/supabase-js';

const url = 'https://vadljxyykrhyeuarzyat.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhZGxqeHl5a3JoeWV1YXJ6eWF0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzE1NDk5NCwiZXhwIjoyMDkyNzMwOTk0fQ.JF_j9g3OpfGB0ZJk0ye0wQU-NEHU6dO4vfMjShcJ2YE';

const supabaseAdmin = createClient(url, key);

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
