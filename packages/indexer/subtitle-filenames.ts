import slugify from "slugify";

export function generateSubtitleFileNames({
  subtitleGroup,
  name,
  resolution,
  releaseGroupName,
  fileNameWithoutExtension,
  fileExtension,
}: {
  subtitleGroup: string;
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
  const subtitleSrtFileName = slugify(`${name}-${resolution}-${releaseGroupName}-${subtitleGroup}.srt`).toLowerCase();
  const downloadFileName = `${fileNameWithoutExtension}.srt`;

  const subtitleFileNameWithoutExtension = slugify(
    `${name}-${resolution}-${releaseGroupName}-${subtitleGroup}`,
  ).toLowerCase();
  const subtitleCompressedFileName = slugify(
    `${name}-${resolution}-${releaseGroupName}-${subtitleGroup}.${fileExtension}`,
  ).toLowerCase();

  return {
    downloadFileName,
    subtitleSrtFileName,
    subtitleCompressedFileName,
    subtitleFileNameWithoutExtension,
  };
}
