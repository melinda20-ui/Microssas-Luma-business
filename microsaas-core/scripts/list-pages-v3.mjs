import { createClient } from '@supabase/supabase-js';

const url = 'https://vadljxyykrhyeuarzyat.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhZGxqeHl5a3JoeWV1YXJ6eWF0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzE1NDk5NCwiZXhwIjoyMDkyNzMwOTk0fQ.JF_j9g3OpfGB0ZJk0ye0wQU-NEHU6dO4vfMjShcJ2YE';

const supabaseAdmin = createClient(url, key, {
  realtime: {
    params: {
      // This might not work to completely disable it if it's used internally,
      // but let's try to avoid triggering the error.
    }
  }
});

// Actually, the error is in the constructor. 
// Let's just use a client that doesn't initialize realtime if possible.
// Since createClient always initializes it, let's just try to use the postgrest client directly if I can.
// Or just use the 'ws' package if it's available.

async function listPages() {
  // Let's try one more thing: bypass Realtime by using a client with no realtime option
  // Actually, I'll just use a regular fetch to get the data if I can't use the client.
  // But it's easier to just install 'ws' or use a different approach.
  
  // Wait, I'll try to use a version of createClient that might not trigger this or just use the postgrest client.
  // But postgrest client is not exported directly like that.
  
  // Let's try to use the 'ws' package which is likely already in node_modules.
  console.log("Attempting to use ws...");
}

listPages();
