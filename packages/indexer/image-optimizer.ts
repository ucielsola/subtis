// 1. Get all Titles (poster, backdrop, logo) from supabase
// 2. Discard those who are not ending in .webp
// 3. Scale down poster to w-[384px] h-[571px] and convert to webp
// 4. Scale down backdrop to w-[384px] h-[216px] and convert to webp
// 5. Convert logo to webp
// 6. Upload to supabase
// 7. Update supabase with new image urls

import sharp from "sharp";

// db
import { supabase } from "@subtis/db";

// helpers
function getFullPathFromSupabasePath(path: string): string {
  return `${process.env.SUPABASE_BASE_URL}/storage/v1/object/public/${path}`;
}

async function optimizeTitleTableImages() {
  const { data, error } = await supabase.from("Titles").select("id, poster, backdrop, logo");

  if (error) {
    console.error(error);
    return;
  }

  console.log("total titles", data.length);

  console.time("optimizeTitleTableImages");
  for await (const title of data) {
    console.log("\n ~ optimizeTitleTableImages ~ title:", title);
    if (title.poster && !title.poster.endsWith(".webp")) {
      // download image
      const image = await fetch(title.poster);
      const imageBlob = await image.blob();
      const imageBuffer = await imageBlob.arrayBuffer();

      // scale down poster to w-[384px] h-[571px] while preserving quality
      const imageWebp = await sharp(imageBuffer)
        .resize(570, 857, { fit: "outside" })
        .toFormat("webp", { quality: 100, effort: 0, lossless: true })
        .toBuffer();

      const newPosterFileName = `${title.poster.split("/").pop()?.split(".")[0]}.webp`;

      // upload to supabase
      const { data, error } = await supabase.storage.from("images").upload(newPosterFileName, imageWebp, {
        upsert: true,
        contentType: "image/webp",
      });

      console.log("\n ~ optimizeTitleTableImages ~ data:", data);

      if (error) {
        console.log("\n ~ optimizeTitleTableImages ~ error:", error);
        console.error(error);
        return;
      }

      const posterPath = getFullPathFromSupabasePath(data.fullPath);
      console.log("\n ~ forawait ~ posterPath:", posterPath);

      // update supabase with new image url
      const wtf = await supabase
        .from("Titles")
        .update({ poster: getFullPathFromSupabasePath(data.fullPath) })
        .eq("id", title.id);

      console.log("\n ~ optimizeTitleTableImages ~ wtf:", wtf);
    }

    // do the same for backdrop
    if (title.backdrop && !title.backdrop.endsWith(".webp")) {
      const image = await fetch(title.backdrop);
      const imageBlob = await image.blob();
      const imageBuffer = await imageBlob.arrayBuffer();

      // scale down backdrop to w-[384px] h-[216px] while preserving quality
      const imageWebp = await sharp(imageBuffer)
        .resize(489, 264, { fit: "outside" })
        .toFormat("webp", { quality: 100, effort: 0, lossless: true })
        .toBuffer();

      const newBackdropFileName = `${title.backdrop.split("/").pop()?.split(".")[0]}.webp`;

      console.log("\n ~ optimizeTitleTableImages ~ newBackdropFileName:", newBackdropFileName);
      // upload to supabase
      const { data, error } = await supabase.storage.from("images").upload(newBackdropFileName, imageWebp, {
        upsert: true,
        contentType: "image/webp",
      });

      if (error) {
        console.error(error);
        return;
      }

      // update supabase with new image url
      await supabase
        .from("Titles")
        .update({ backdrop: getFullPathFromSupabasePath(data.fullPath) })
        .eq("id", title.id);
    }

    // do the same for logo
    if (title.logo && !title.logo.endsWith(".webp")) {
      const image = await fetch(title.logo);
      const imageBlob = await image.blob();
      const imageBuffer = await imageBlob.arrayBuffer();

      // convert to webp
      const imageWebp = await sharp(imageBuffer)
        .toFormat("webp", { quality: 100, effort: 0, lossless: true })
        .toBuffer();

      const newLogoFileName = `${title.logo.split("/").pop()?.split(".")[0]}.webp`;

      console.log("\n ~ optimizeTitleTableImages ~ newLogoFileName:", newLogoFileName);
      // upload to supabase
      const { data, error } = await supabase.storage.from("images").upload(newLogoFileName, imageWebp, {
        upsert: true,
        contentType: "image/webp",
      });
      if (error) {
        console.error(error);
        return;
      }

      // update supabase with new image url
      await supabase
        .from("Titles")
        .update({ logo: getFullPathFromSupabasePath(data.fullPath) })
        .eq("id", title.id);
    }
  }

  console.timeEnd("optimizeTitleTableImages");
}

optimizeTitleTableImages();
