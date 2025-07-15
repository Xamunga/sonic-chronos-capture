export const APP_VERSION = "2.6.0";

export const updateVersion = (major: number, minor: number, patch: number): string => {
  return `${major}.${minor}.${patch}`;
};

export const getFullVersionString = (): string => {
  return `Gravador Real Time Pro v${APP_VERSION} | Desenvolvido por Tiago Lacerda`;
};