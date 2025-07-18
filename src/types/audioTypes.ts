export type DateFolderFormat = 'dd-mm' | 'mm-dd-yyyy' | 'ddmmyy';
export type FileNameFormat = 'hh-mm-ss-seq' | 'ddmmyy_hhmmss';

export interface MP3MetadataSettings {
  title: string;
  artist: string;
  album: string;
  year: string;
  genre: string;
  comment: string;
}

export interface AudioSettings {
  inputDevice: string;
  outputFormat: string;
  mp3Bitrate: number;
  outputDirectory: string;
  noiseSuppressionEnabled: boolean;
  splitRecordingEnabled: boolean;
  splitIntervalMinutes: number;
  autoDeleteEnabled: boolean;
  autoDeleteDays: number;
  dateFolderEnabled: boolean;
  dateFolderFormat: DateFolderFormat;
  fileNameFormat: FileNameFormat;
  mp3Metadata: MP3MetadataSettings;
}