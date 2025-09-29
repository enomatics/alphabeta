export interface GlyphData {
  id: string;
  character: string;
  unicodeValue: number;
  konvaData: any;
  pathData: string;
  width: number;
  height: number;
  advance: number;
}

export interface FontMetadata {
  id: string;
  name: string;
  author: string;
  authorId: string;
  creationDate: Date;
  version: string;
  style: string;
  weight: number;
  unitsPerEm: number;
  ascender: number;
  descender: number;
  lineGap: number;
  description?: string;
  license?: string;
}

export interface FontProject {
  metadata: FontMetadata;
  glyphs: GlyphData[];
  fontSettings: {
    unitePerEm: number;
    ascender: number;
    descender: number;
    lineGap: number;
  };
}
