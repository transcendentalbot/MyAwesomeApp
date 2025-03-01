export interface CaptionSettings {
  font: {
    family: string;
    size: number;
    weight: string;
    color: string;
    strokeColor: string;
    strokeWidth: number;
  };
  position: {
    vertical: 'top' | 'middle' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
    paddingBottom: number;
    paddingLeft: number;
    paddingRight: number;
  };
  style: {
    backgroundColor: string;
    textAlign: 'left' | 'center' | 'right';
    lineHeight: number;
    maxWidth: string;
    borderRadius: number;
    padding: number;
  };
  animation: {
    type: 'fade' | 'slide' | 'none';
    duration: number;
    delay: number;
    easing: string;
  };
  timing: {
    wordDuration: number;
    minDuration: number;
    maxDuration: number;
  };
  accessibility: {
    enabled: boolean;
    fontSize: string;
    contrast: 'normal' | 'high';
    screenReaderOnly: boolean;
  };
  format: {
    type: 'SRT' | 'VTT';
    splitStrategy: 'sentence' | 'word' | 'character';
    maxLinesPerCaption: number;
    maxCharactersPerLine: number;
  };
  language: {
    primary: string;
    fallback: string;
  };
}

// Sample configuration
export const defaultCaptionSettings: CaptionSettings = {
  font: {
    family: "Arial",
    size: 48,
    weight: "bold",
    color: "#FFFFFF",
    strokeColor: "#000000",
    strokeWidth: 2
  },
  position: {
    vertical: "bottom",
    horizontal: "center",
    paddingBottom: 50,
    paddingLeft: 0,
    paddingRight: 0
  },
  style: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    textAlign: "center",
    lineHeight: 1.5,
    maxWidth: "80%",
    borderRadius: 8,
    padding: 12
  },
  animation: {
    type: "fade",
    duration: 0.5,
    delay: 0.2,
    easing: "ease-in-out"
  },
  timing: {
    wordDuration: 0.3,
    minDuration: 2,
    maxDuration: 6
  },
  accessibility: {
    enabled: true,
    fontSize: "1.2em",
    contrast: "high",
    screenReaderOnly: false
  },
  format: {
    type: "SRT",
    splitStrategy: "sentence",
    maxLinesPerCaption: 2,
    maxCharactersPerLine: 42
  },
  language: {
    primary: "en-US",
    fallback: "en"
  }
}; 