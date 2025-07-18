import lamejs from 'lamejs';

export interface MP3Metadata {
  title?: string;
  artist?: string;
  album?: string;
  year?: number;
  genre?: string;
  comment?: string;
}

export class MP3Encoder {
  private mp3encoder: any;
  private channels: number;
  private sampleRate: number;
  private bitRate: number;

  constructor(channels: number = 1, sampleRate: number = 44100, bitRate: number) {
    this.channels = channels;
    this.sampleRate = sampleRate;
    this.bitRate = bitRate;
    this.mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, bitRate);
  }

  // Converter Float32Array para Int16Array
  private floatTo16BitPCM(input: Float32Array): Int16Array {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const sample = Math.max(-1, Math.min(1, input[i]));
      output[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    }
    return output;
  }

  // Codificar áudio para MP3
  encodeBuffer(audioBuffer: Float32Array): Uint8Array {
    const pcmData = this.floatTo16BitPCM(audioBuffer);
    const mp3Data = this.mp3encoder.encodeBuffer(pcmData);
    return new Uint8Array(mp3Data);
  }

  // Finalizar encoding
  flush(): Uint8Array {
    const mp3Data = this.mp3encoder.flush();
    return new Uint8Array(mp3Data);
  }

  // Criar arquivo MP3 completo com metadados
  async createMP3File(
    audioChunks: Float32Array[], 
    metadata: MP3Metadata
  ): Promise<Uint8Array> {
    const mp3Chunks: Uint8Array[] = [];
    
    // Processar chunks de áudio
    for (const chunk of audioChunks) {
      const mp3Chunk = this.encodeBuffer(chunk);
      if (mp3Chunk.length > 0) {
        mp3Chunks.push(mp3Chunk);
      }
    }
    
    // Finalizar encoding
    const finalChunk = this.flush();
    if (finalChunk.length > 0) {
      mp3Chunks.push(finalChunk);
    }
    
    // Combinar chunks
    const totalLength = mp3Chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const mp3Data = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const chunk of mp3Chunks) {
      mp3Data.set(chunk, offset);
      offset += chunk.length;
    }
    
    // Adicionar metadados ID3
    return this.addID3Tags(mp3Data, metadata);
  }

  // Adicionar tags ID3v2
  private addID3Tags(mp3Data: Uint8Array, metadata: MP3Metadata): Uint8Array {
    const id3Header = this.createID3Header(metadata);
    const result = new Uint8Array(id3Header.length + mp3Data.length);
    result.set(id3Header, 0);
    result.set(mp3Data, id3Header.length);
    return result;
  }

  // Criar header ID3v2
  private createID3Header(metadata: MP3Metadata): Uint8Array {
    const frames: Uint8Array[] = [];
    
    // Frame TIT2 (Título)
    if (metadata.title) {
      frames.push(this.createTextFrame('TIT2', metadata.title));
    }
    
    // Frame TPE1 (Artista)
    if (metadata.artist) {
      frames.push(this.createTextFrame('TPE1', metadata.artist));
    }
    
    // Frame TALB (Álbum)
    if (metadata.album) {
      frames.push(this.createTextFrame('TALB', metadata.album));
    }
    
    // Frame TYER (Ano)
    if (metadata.year) {
      frames.push(this.createTextFrame('TYER', metadata.year.toString()));
    }
    
    // Frame TCON (Gênero)
    if (metadata.genre) {
      frames.push(this.createTextFrame('TCON', metadata.genre));
    }
    
    // Frame COMM (Comentário)
    if (metadata.comment) {
      frames.push(this.createCommentFrame(metadata.comment));
    }
    
    // Calcular tamanho total dos frames
    const framesSize = frames.reduce((sum, frame) => sum + frame.length, 0);
    
    // Header ID3v2
    const header = new Uint8Array(10);
    header.set([0x49, 0x44, 0x33], 0); // "ID3"
    header[3] = 0x03; // Versão 2.3
    header[4] = 0x00; // Revisão
    header[5] = 0x00; // Flags
    
    // Tamanho (synchsafe integer)
    const size = framesSize;
    header[6] = (size >>> 21) & 0x7F;
    header[7] = (size >>> 14) & 0x7F;
    header[8] = (size >>> 7) & 0x7F;
    header[9] = size & 0x7F;
    
    // Combinar header + frames
    const result = new Uint8Array(10 + framesSize);
    result.set(header, 0);
    let offset = 10;
    
    for (const frame of frames) {
      result.set(frame, offset);
      offset += frame.length;
    }
    
    return result;
  }

  // Criar frame de texto
  private createTextFrame(frameId: string, text: string): Uint8Array {
    const textBytes = new TextEncoder().encode(text);
    const frame = new Uint8Array(10 + 1 + textBytes.length);
    
    // Frame ID
    frame.set(new TextEncoder().encode(frameId), 0);
    
    // Tamanho do frame (sem header)
    const size = 1 + textBytes.length;
    frame[4] = (size >>> 24) & 0xFF;
    frame[5] = (size >>> 16) & 0xFF;
    frame[6] = (size >>> 8) & 0xFF;
    frame[7] = size & 0xFF;
    
    // Flags
    frame[8] = 0x00;
    frame[9] = 0x00;
    
    // Encoding (UTF-8)
    frame[10] = 0x03;
    
    // Texto
    frame.set(textBytes, 11);
    
    return frame;
  }

  // Criar frame de comentário
  private createCommentFrame(comment: string): Uint8Array {
    const commentBytes = new TextEncoder().encode(comment);
    const frame = new Uint8Array(10 + 1 + 3 + 1 + commentBytes.length);
    
    // Frame ID "COMM"
    frame.set(new TextEncoder().encode('COMM'), 0);
    
    // Tamanho
    const size = 1 + 3 + 1 + commentBytes.length;
    frame[4] = (size >>> 24) & 0xFF;
    frame[5] = (size >>> 16) & 0xFF;
    frame[6] = (size >>> 8) & 0xFF;
    frame[7] = size & 0xFF;
    
    // Flags
    frame[8] = 0x00;
    frame[9] = 0x00;
    
    // Encoding
    frame[10] = 0x03;
    
    // Idioma
    frame.set(new TextEncoder().encode('por'), 11);
    
    // Descrição vazia
    frame[14] = 0x00;
    
    // Comentário
    frame.set(commentBytes, 15);
    
    return frame;
  }
}