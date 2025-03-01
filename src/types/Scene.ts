export interface Scene {
  scene: string;
  setting: string;
  time_of_day: string;
  background: string;
  mood: string;
  expressiveness: string;
  visual_details: string;
  timeline: string;
  imageUrl?: string;
  imageUrls?: string[];  // Array to store multiple image URLs per scene
  generatedImageCount?: number;  // Track number of images generated for this scene
} 