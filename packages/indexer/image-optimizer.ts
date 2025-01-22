import sharp from "sharp";
import * as ThumbHash from "thumbhash";

// db
import { supabase } from "@subtis/db";

// internals
import { getImageData } from "./utils/thumbhash";

// helpers
function getFullPathFromSupabasePath(path: string): string {
  return `${process.env.SUPABASE_BASE_URL}/storage/v1/object/public/${path}`;
}

async function optimizeTitleTableImages() {
  const { data, error } = await supabase
    .from("Titles")
    .select("id, poster, backdrop, logo, optimized_poster, optimized_backdrop, optimized_logo");

  if (error) {
    console.error(error);
    return;
  }

  console.log("total titles", data.length);

  console.time("optimizeTitleTableImages");
  for await (const title of data) {
    console.log("\n ~ optimizeTitleTableImages ~ title:", title);
    if (title.poster && title.optimized_poster && !title.optimized_poster.endsWith(".webp")) {
      // download image
      const image = await fetch(title.poster);
      const imageBlob = await image.blob();
      const imageBuffer = await imageBlob.arrayBuffer();

      const MAX_IMAGE_WIDTH = 380;
      const MAX_IMAGE_HEIGHT = 571;

      const imageWebp = await sharp(imageBuffer)
        .resize(Math.floor(MAX_IMAGE_WIDTH * 1.1), Math.floor(MAX_IMAGE_HEIGHT * 1.1), { fit: "outside" })
        .toFormat("webp", { quality: 90, effort: 0, lossless: true })
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
      await supabase.from("Titles").update({ optimized_poster: posterPath }).eq("id", title.id);

      // update thumbhash
      const { data: thumbhashData, width, height } = await getImageData(imageWebp);

      const binaryThumbHash = ThumbHash.rgbaToThumbHash(width, height, thumbhashData);
      const thumbHashToBase64 = Buffer.from(binaryThumbHash).toString("base64");

      await supabase.from("Titles").update({ poster_thumbhash: thumbHashToBase64 }).eq("id", title.id);
    }

    // do the same for backdrop
    if (title.backdrop && title.optimized_backdrop && !title.optimized_backdrop.endsWith(".webp")) {
      const image = await fetch(title.backdrop);
      const imageBlob = await image.blob();
      const imageBuffer = await imageBlob.arrayBuffer();

      const MAX_IMAGE_WIDTH = 326;
      const MAX_IMAGE_HEIGHT = 176;

      const imageWebp = await sharp(imageBuffer)
        .resize(Math.floor(MAX_IMAGE_WIDTH * 1.2), Math.floor(MAX_IMAGE_HEIGHT * 1.2), { fit: "outside" })
        .toFormat("webp", { quality: 90, effort: 0, lossless: true })
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
        .update({ optimized_backdrop: getFullPathFromSupabasePath(data.fullPath) })
        .eq("id", title.id);

      // update thumbhash
      const { data: thumbhashData, width, height } = await getImageData(imageWebp);

      const binaryThumbHash = ThumbHash.rgbaToThumbHash(width, height, thumbhashData);
      const thumbHashToBase64 = Buffer.from(binaryThumbHash).toString("base64");

      await supabase.from("Titles").update({ backdrop_thumbhash: thumbHashToBase64 }).eq("id", title.id);
    }

    // do the same for logo
    if (title.logo && title.optimized_logo && !title.optimized_logo.endsWith(".webp")) {
      const image = await fetch(title.logo);
      const imageBlob = await image.blob();
      const imageBuffer = await imageBlob.arrayBuffer();

      // convert to webp
      const imageWebp = await sharp(imageBuffer)
        .toFormat("webp", { quality: 90, effort: 0, lossless: true })
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
        .update({ optimized_logo: getFullPathFromSupabasePath(data.fullPath) })
        .eq("id", title.id);
    }
  }

  console.timeEnd("optimizeTitleTableImages");
}

optimizeTitleTableImages();
