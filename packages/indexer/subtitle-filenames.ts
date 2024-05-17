import slugify from "slugify";

export function generateSubtitleFileNames({
  subtitleGroupName,
  name,
  resolution,
  releaseGroupName,
  fileNameWithoutExtension,
  fileExtension,
}: {
  subtitleGroupName: string;
  name: string;
  resolution: string;
  releaseGroupName: string;
  fileNameWithoutExtension: string;
  fileExtension: string;
}): {
  downloadFileName: string;
  subtitleSrtFileName: string;
  subtitleCompressedFileName: string;
  subtitleFileNameWithoutExtension: string;
} {
  const subtitleSrtFileName = slugify(
    `${name}-${resolution}-${releaseGroupName}-${subtitleGroupName}.srt`,
  ).toLowerCase();
  const downloadFileName = `${fileNameWithoutExtension}.srt`;

  const subtitleFileNameWithoutExtension = slugify(
    `${name}-${resolution}-${releaseGroupName}-${subtitleGroupName}`,
  ).toLowerCase();
  const subtitleCompressedFileName = slugify(
    `${name}-${resolution}-${releaseGroupName}-${subtitleGroupName}.${fileExtension}`,
  ).toLowerCase();

  return {
    downloadFileName,
    subtitleSrtFileName,
    subtitleCompressedFileName,
    subtitleFileNameWithoutExtension,
  };
}
