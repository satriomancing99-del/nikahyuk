import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://mcjydsmutpqzmzftmvqy.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1janlkc211dHBxem16ZnRtdnF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NzQ0MzMsImV4cCI6MjA5NTM1MDQzM30.Jg6opGrfTK2bj7F1V5fdsjYLAb5MiVojE3p97449WFc";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Updating eternal-rustic-premium template in the remote database...");
  
  const { data: tpl, error: fetchError } = await supabase
    .from('templates')
    .select('id, name, jsx_code')
    .eq('slug', 'eternal-rustic-premium')
    .single();

  if (fetchError || !tpl) {
    console.error("Error fetching template:", fetchError);
    return;
  }

  let code = tpl.jsx_code || '';
  const oldText = `Assalamu'alaikum Warahmatullahi Wabarakatuh`;
  const newText = `{mempelai?.greeting || "Assalamu'alaikum Warahmatullahi Wabarakatuh"}`;

  if (code.includes(oldText)) {
    console.log("Found hardcoded greeting. Replacing...");
    code = code.replace(oldText, newText);

    const { error: updateError } = await supabase
      .from('templates')
      .update({ jsx_code: code })
      .eq('id', tpl.id);

    if (updateError) {
      console.error("Error updating template:", updateError);
    } else {
      console.log("Template updated successfully to be universal!");
    }
  } else {
    console.log("No hardcoded greeting found in template or already updated.");
  }
}

run();
