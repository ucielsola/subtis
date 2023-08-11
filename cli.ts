import { getSupabaseClient } from "./supabase";

// supabase
const supabase = getSupabaseClient();

async function cli() {
  const args = process.argv;
  const fileName = args.at(-1);
  console.log("\n ~ cli ~ fileName:", fileName);

  const { data: subtitles, error } = await supabase
    .from("Subtitles")
    .select("*")
    .eq("fileName", fileName);

  if (!error) {
    const [subtitle] = subtitles;
    const { subtitleLink } = subtitle;
    console.log("\n ~ cli ~ subtitleLink:", subtitleLink);
  } else {
    console.log("\n ~ cli ~ error:", error);
  }
}

cli();
