const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('Connecting to:', supabaseUrl);
  try {
    const { data: templates, error } = await supabase
      .from('templates')
      .select('*');
    
    if (error) {
      console.error('Error fetching templates:', error);
      return;
    }
    
    console.log('Successfully fetched templates:', templates.length);
    templates.forEach(t => {
      console.log(`- ID: ${t.id}, Name: ${t.name}, Slug: ${t.slug}, Has JSX Code: ${!!t.jsx_code}`);
    });
  } catch (e) {
    console.error('Exception:', e);
  }
}

run();
