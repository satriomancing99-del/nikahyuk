import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = "https://mcjydsmutpqzmzftmvqy.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1janlkc211dHBxem16ZnRtdnF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NzQ0MzMsImV4cCI6MjA5NTM1MDQzM30.Jg6opGrfTK2bj7F1V5fdsjYLAb5MiVojE3p97449WFc";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Fetching template 'noor-celestial-majlis-premium'...");
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('slug', 'noor-celestial-majlis-premium')
    .single();

  if (error) {
    console.error("Error fetching from DB:", error);
    return;
  }

  if (!data) {
    console.log("No template found with slug 'noor-celestial-majlis-premium'.");
    return;
  }

  console.log("Template found! Writing jsx_code to template_code.txt...");
  fs.writeFileSync('template_code.txt', data.jsx_code || 'NO JSX CODE');
  console.log("Done!");
}

run();
