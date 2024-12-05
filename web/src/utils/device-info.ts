export enum OS {
  MAC = 'mac',
  WINDOWS = 'win',
  LINUX = 'linux',
  UNKNOWN = 'unknown',
}

export function getOS() {
  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.indexOf(OS.WINDOWS) > -1) return OS.WINDOWS;

  if (userAgent.indexOf(OS.MAC) > -1) return OS.MAC;

  if (userAgent.indexOf(OS.MAC) > -1) return OS.LINUX;

  return OS.UNKNOWN;
}
