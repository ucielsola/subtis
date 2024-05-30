import slugify from "slugify";

export function generateSubtitleFileNames({
  subtitleGroupName,
  name,
  resolution,
  releaseGroupName,
  fileNameWithoutExtension,
  fileExtension,
  episode,
}: {
  subtitleGroupName: string;
  name: string;
  resolution: string;
  releaseGroupName: string;
  fileNameWithoutExtension: string;
  fileExtension: string;
  episode: string | null;
}): {
  downloadFileName: string;
  subtitleSrtFileName: string;
  subtitleCompressedFileName: string;
  subtitleFileNameWithoutExtension: string;
} {
  if (episode) {
    const subtitleSrtFileName = slugify(
      `${name}-${episode}-${resolution}-${releaseGroupName}-${subtitleGroupName}.srt`,
    ).toLowerCase();
    const downloadFileName = `${fileNameWithoutExtension}.srt`;

    const subtitleFileNameWithoutExtension = slugify(
      `${name}-${episode}-${resolution}-${releaseGroupName}-${subtitleGroupName}`,
    ).toLowerCase();
    const subtitleCompressedFileName = slugify(
      `${name}-${episode}-${resolution}-${releaseGroupName}-${subtitleGroupName}.${fileExtension}`,
    ).toLowerCase();

    return {
      downloadFileName,
      subtitleSrtFileName,
      subtitleCompressedFileName,
      subtitleFileNameWithoutExtension,
    };
  }

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
