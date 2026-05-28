import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://mcjydsmutpqzmzftmvqy.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1janlkc211dHBxem16ZnRtdnF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NzQ0MzMsImV4cCI6MjA5NTM1MDQzM30.Jg6opGrfTK2bj7F1V5fdsjYLAb5MiVojE3p97449WFc";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Fetching one transaction to inspect columns...");
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .limit(1);

  if (error) {
    console.error("Error fetching transactions:", error);
  } else {
    console.log("Transaction sample data fetched:", data);
  }
}

run();
