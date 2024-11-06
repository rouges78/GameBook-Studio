export interface Action {
  'N.Par.': string;
  text: string;
  [key: string]: any;
}

export interface Paragraph {
  id: number;
  title: string;
  type: 'normale' | 'nodo' | 'finale';
  actions: Action[];
  x?: number;
  y?: number;
  locked?: boolean;
}

export interface MapSettings {
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

export interface ExtendedParagraph extends Paragraph {
  content: string;
  incomingConnections: number[];
  outgoingConnections: string[];
  image?: {
    data: string;
    position: 'before' | 'after';
  };
  tags?: string[];
  font?: string;
  alignment?: 'left' | 'center' | 'right';
}
