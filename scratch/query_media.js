import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://mcjydsmutpqzmzftmvqy.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1janlkc211dHBxem16ZnRtdnF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NzQ0MzMsImV4cCI6MjA5NTM1MDQzM30.Jg6opGrfTK2bj7F1V5fdsjYLAb5MiVojE3p97449WFc";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Fetching all invitations...");
  const { data: invitations, error: invErr } = await supabase
    .from('invitations')
    .select('id, slug, groom_name, bride_name');
  
  if (invErr) {
    console.error("Error fetching invitations:", invErr);
    return;
  }

  console.log("Invitations list:", invitations);

  for (const inv of invitations) {
    console.log(`\nFetching media for invitation: ${inv.groom_name} & ${inv.bride_name} (Slug: ${inv.slug})`);
    const { data: media, error: medErr } = await supabase
      .from('media')
      .select('*')
      .eq('invitation_id', inv.id);
    
    if (medErr) {
      console.error(`Error fetching media for ${inv.id}:`, medErr);
    } else {
      console.log(`Media list for ${inv.id}:`, media);
    }
  }
}

run();
