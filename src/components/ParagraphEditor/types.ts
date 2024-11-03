export interface MapSettings {
  positions: {
    [key: string]: {
      x: number;
      y: number;
    };
  };
  backgroundImage: string | null;
  imageAdjustments: {
    contrast: number;
    transparency: number;
    blackAndWhite: number;
    sharpness: number;
    brightness: number;
    width: number;
    height: number;
    maintainAspectRatio: boolean;
  };
}

export interface Paragraph {
  id: string;
  text: string;
  choices: {
    text: string;
    destination: string;
  }[];
  x?: number;
  y?: number;
}

export interface Project {
  bookTitle: string;
  author: string;
  paragraphs: Paragraph[];
  lastEdited: string;
  coverImage?: string;
  mapSettings?: MapSettings;
}

export interface ImageData {
  bookTitle: string;
  imageData: string;
}
