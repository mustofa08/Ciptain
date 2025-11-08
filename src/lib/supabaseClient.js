import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dnvdlexhbxqeuvxxtrgx.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRudmRsZXhoYnhxZXV2eHh0cmd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MTMxNDksImV4cCI6MjA3Nzk4OTE0OX0.EBd08hy-rvNJ1iBByBAgoqRVArr82RXt8GUqEmBU_is";
export const supabase = createClient(supabaseUrl, supabaseKey);
