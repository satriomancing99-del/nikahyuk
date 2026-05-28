import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://mcjydsmutpqzmzftmvqy.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1janlkc211dHBxem16ZnRtdnF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NzQ0MzMsImV4cCI6MjA5NTM1MDQzM30.Jg6opGrfTK2bj7F1V5fdsjYLAb5MiVojE3p97449WFc";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Fetching all templates to search for placeholders...");
  const { data: templates, error } = await supabase
    .from('templates')
    .select('id, name, slug, jsx_code');

  if (error) {
    console.error("Error fetching templates:", error);
    return;
  }

  console.log(`Fetched ${templates?.length || 0} templates.`);
  
  for (const t of templates || []) {
    const code = t.jsx_code || '';
    if (code.toLowerCase().includes('syariah') || code.toLowerCase().includes('aditya') || code.toLowerCase().includes('1234567890')) {
      console.log(`\n==========================================`);
      console.log(`MATCH FOUND in template: "${t.name}" (slug: "${t.slug}", id: "${t.id}")`);
      
      // Print lines containing match
      const lines = code.split('\n');
      lines.forEach((line, idx) => {
        if (line.toLowerCase().includes('syariah') || line.toLowerCase().includes('aditya') || line.toLowerCase().includes('1234567890')) {
          console.log(`Line ${idx + 1}: ${line.trim()}`);
        }
      });
    }
  }
  console.log("\nSearch complete!");
}

run();
