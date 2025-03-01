export interface VoiceCapability {
  isNeural?: boolean;
  isLongForm?: boolean;
  isGenerative?: boolean;
  isStandard?: boolean;
  isBilingual?: boolean;
}

export interface Language {
  code: string;
  name: string;
  region?: string;
  voices: Voice[];
}

export interface Voice {
  id: string;
  name: string;
  gender: 'male' | 'female';
  capabilities: VoiceCapability;
  languages: string[];
  addedDate?: string;
}

export interface VoiceEngine {
  id: 'generative' | 'long-form' | 'neural' | 'standard';
  title: string;
  description: string;
  languages: EngineLanguage[];
}

export interface EngineLanguage {
  code: string;
  name: string;
  region: string;
  voices: Voice[];
}

export interface Voice {
  id: string;
  name: string;
  gender: 'male' | 'female';
  addedDate?: string;
  isBilingual?: boolean;
  supportedLanguages?: string[];
}

export const voiceData = {
  languages: [
    {
      code: 'en-US',
      name: 'English',
      region: 'United States',
      voices: [
        {
          id: 'Ruth',
          name: 'Ruth',
          gender: 'female',
          capabilities: {
            isGenerative: true,
            isLongForm: true,
            isNeural: true
          },
          languages: ['en-US'],
          addedDate: '2024-03-28'
        },
        {
          id: 'Matthew',
          name: 'Matthew',
          gender: 'male',
          capabilities: {
            isGenerative: true,
            isNeural: true
          },
          languages: ['en-US']
        },
        {
          id: 'Stephen',
          name: 'Stephen',
          gender: 'male',
          capabilities: {
            isGenerative: true
          },
          languages: ['en-US']
        },
        {
          id: 'Kevin',
          name: 'Kevin',
          gender: 'male',
          capabilities: {
            isNeural: true
          },
          languages: ['en-US']
        }
      ]
    },
    {
      code: 'en-IN',
      name: 'English',
      region: 'India',
      voices: [
        {
          id: 'Aditi',
          name: 'Aditi',
          gender: 'female',
          capabilities: {
            isNeural: true
          },
          languages: ['en-IN', 'hi-IN'],
          isBilingual: true
        }
      ]
    },
    {
      code: 'hi-IN',
      name: 'Hindi',
      region: 'India',
      voices: [
        {
          id: 'Aditi',
          name: 'Aditi',
          gender: 'female',
          capabilities: {
            isNeural: true
          },
          languages: ['en-IN', 'hi-IN'],
          isBilingual: true
        }
      ]
    },
    {
      code: 'es-ES',
      name: 'Spanish',
      region: 'Spain',
      voices: [
        {
          id: 'Lucia',
          name: 'Lucia',
          gender: 'female',
          capabilities: {
            isNeural: true
          },
          languages: ['es-ES']
        }
      ]
    },
    {
      code: 'es-MX',
      name: 'Spanish',
      region: 'Mexico',
      voices: [
        {
          id: 'Mia',
          name: 'Mia',
          gender: 'female',
          capabilities: {
            isNeural: true
          },
          languages: ['es-MX']
        }
      ]
    },
    {
      code: 'fr-FR',
      name: 'French',
      region: 'France',
      voices: [
        {
          id: 'Lea',
          name: 'Léa',
          gender: 'female',
          capabilities: {
            isNeural: true
          },
          languages: ['fr-FR']
        }
      ]
    },
    {
      code: 'ko-KR',
      name: 'Korean',
      region: 'Korea',
      voices: [
        {
          id: 'Seoyeon',
          name: 'Seoyeon',
          gender: 'female',
          capabilities: {
            isNeural: true
          },
          languages: ['ko-KR']
        }
      ]
    }
  ],
  
  // Helper functions
  getVoicesByCapability(capability: keyof VoiceCapability): Voice[] {
    return this.languages.flatMap(lang => 
      lang.voices.filter(voice => voice.capabilities[capability])
    );
  },
  
  getVoicesByLanguage(languageCode: string): Voice[] {
    return this.languages
      .find(lang => lang.code === languageCode)
      ?.voices || [];
  },
  
  getBilingualVoices(): Voice[] {
    return this.languages.flatMap(lang => 
      lang.voices.filter(voice => voice.languages.length > 1)
    );
  }
};

// Restructured voice data organized by engine type
export const voiceEngines: VoiceEngine[] = [
  {
    id: 'generative',
    title: 'Generative',
    description: 'Produces the most expressive and adaptive speech using Generative AI',
    languages: [
      {
        code: 'en-US',
        name: 'English',
        region: 'United States',
        voices: [
          { id: 'Ruth', name: 'Ruth', gender: 'female', addedDate: '2024-03-28' },
          { id: 'Amy', name: 'Amy', gender: 'female' },
          { id: 'Matthew', name: 'Matthew', gender: 'male' },
          { id: 'Stephen', name: 'Stephen', gender: 'male' },
          { id: 'Olivia', name: 'Olivia', gender: 'female' },
          { id: 'Joanna', name: 'Joanna', gender: 'female' },
          { id: 'Danielle', name: 'Danielle', gender: 'female' }
        ]
      },
      {
        code: 'es-ES',
        name: 'Spanish',
        region: 'Spain',
        voices: [
          { id: 'Pedro', name: 'Pedro', gender: 'male' },
          { id: 'Andrés', name: 'Andrés', gender: 'male' },
          { id: 'Sergio', name: 'Sergio', gender: 'male' }
        ]
      },
      {
        code: 'fr-FR',
        name: 'French',
        region: 'France',
        voices: [
          { id: 'Léa', name: 'Léa', gender: 'female' },
          { id: 'Rémi', name: 'Rémi', gender: 'male' }
        ]
      },
      {
        code: 'hi-IN',
        name: 'Hindi',
        region: 'India',
        voices: [
          { id: 'Kajal', name: 'Kajal', gender: 'female' }
        ]
      },
      {
        code: 'it-IT',
        name: 'Italian',
        region: 'Italy',
        voices: [
          { id: 'Bianca', name: 'Bianca', gender: 'female' }
        ]
      }
    ]
  },
  {
    id: 'long-form',
    title: 'Long-Form',
    description: 'Produces the most natural sounding speech for longer content',
    languages: [
      {
        code: 'en-US',
        name: 'English',
        region: 'United States',
        voices: [
          { id: 'Patrick', name: 'Patrick', gender: 'male' },
          { id: 'Ruth', name: 'Ruth', gender: 'female' },
          { id: 'Danielle', name: 'Danielle', gender: 'female' },
          { id: 'Gregory', name: 'Gregory', gender: 'male' }
        ]
      },
      {
        code: 'es-ES',
        name: 'Spanish',
        region: 'Spain',
        voices: [
          { id: 'Alba', name: 'Alba', gender: 'female' },
          { id: 'Raúl', name: 'Raúl', gender: 'male' }
        ]
      }
    ]
  },
  {
    id: 'neural',
    title: 'Neural',
    description: 'Produces more natural and human-like speech than Standard Engine',
    languages: [
      {
        code: 'en-US',
        name: 'English',
        region: 'United States',
        voices: [
          { id: 'Joanna', name: 'Joanna', gender: 'female' },
          { id: 'Matthew', name: 'Matthew', gender: 'male' },
          { id: 'Danielle', name: 'Danielle', gender: 'female' },
          { id: 'Gregory', name: 'Gregory', gender: 'male' }
        ]
      },
      {
        code: 'en-IN',
        name: 'English',
        region: 'India',
        voices: [
          { 
            id: 'Aditi', 
            name: 'Aditi', 
            gender: 'female',
            isBilingual: true,
            supportedLanguages: ['en-IN', 'hi-IN']
          }
        ]
      },
      {
        code: 'hi-IN',
        name: 'Hindi',
        region: 'India',
        voices: [
          { 
            id: 'Aditi', 
            name: 'Aditi', 
            gender: 'female',
            isBilingual: true,
            supportedLanguages: ['en-IN', 'hi-IN']
          }
        ]
      },
      {
        code: 'es-ES',
        name: 'Spanish',
        region: 'Spain',
        voices: [
          { id: 'Lucia', name: 'Lucia', gender: 'female' }
        ]
      },
      {
        code: 'tr-TR',
        name: 'Turkish',
        region: 'Turkey',
        voices: [
          { id: 'Burcu', name: 'Burcu', gender: 'female' }
        ]
      }
    ]
  },
  {
    id: 'standard',
    title: 'Standard',
    description: 'Produces natural-sounding speech',
    languages: [
      {
        code: 'en-US',
        name: 'English',
        region: 'United States',
        voices: [
          { id: 'Joanna', name: 'Joanna', gender: 'female' },
          { id: 'Matthew', name: 'Matthew', gender: 'male' },
          { id: 'Ivy', name: 'Ivy', gender: 'female' },
          { id: 'Justin', name: 'Justin', gender: 'male' },
          { id: 'Kendra', name: 'Kendra', gender: 'female' }
        ]
      }
    ]
  }
]; 