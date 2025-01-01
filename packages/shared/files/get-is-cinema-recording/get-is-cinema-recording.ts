const CINEMA_RECORDING_REGEX =
  /\b(hdcam|hdtc|hc|hdcamrip|hqcam|hq-cam|telesync|hdts|hd-ts|c1nem4|qrips|cam|soundtrack|xxx|clean|khz|ep|camrip|dvdscr|hdcam-rip|hdcam-c1nem4|flac|tsrip|widescreen)\b/gi;

export function getIsCinemaRecording(title: string): boolean {
  return Boolean(title.match(CINEMA_RECORDING_REGEX));
}
