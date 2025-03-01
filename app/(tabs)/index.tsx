import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Modal, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useTheme } from '../../src/theme/ThemeContext';
import { WorkflowStepper } from '../../src/components/workflow/WorkflowStepper';
import { ScriptEditor } from '../../src/components/workflow/ScriptEditor';
import { SceneGenerator } from '../../src/components/workflow/SceneGenerator';
import { AudioSelector } from '../../src/components/workflow/AudioSelector';
import { CaptionEditor } from '../../src/components/workflow/CaptionEditor';
import { MovieRenderer } from '../../src/components/workflow/MovieRenderer';

const WORKFLOW_STEPS = [
  { 
    id: 1, 
    title: 'Script', 
    icon: 'document-text',
    color: '#4CAF50' // Green
  },
  { 
    id: 2, 
    title: 'Scenes', 
    icon: 'images',
    color: '#2196F3' // Blue
  },
  { 
    id: 3, 
    title: 'Audio', 
    icon: 'musical-notes',
    color: '#9C27B0' // Purple
  },
  { 
    id: 4, 
    title: 'Captions', 
    icon: 'text',
    color: '#FF9800' // Orange
  },
  { 
    id: 5, 
    title: 'Render', 
    icon: 'film',
    color: '#F44336' // Red
  },
];

interface Character {
  name: string;
  description: string;
}

interface Setting {
  location: string;
  time: string;
}

interface ScriptAnalysis {
  story_title: string;
  characters: Character[];
  setting: Setting;
  plot: string[];
  moral: string;
}

interface Scene {
  scene: string;
  setting: string;
  time_of_day: string;
  background: string;
  mood: string;
  expressiveness: string;
  visual_details: string;
  timeline: string;
}

interface ScenePreferences {
  genre: string;
  style: string;
  tone: string;
  pacing: string;
}

interface SceneImage {
  url: string;
  sceneIndex: number;
}

const SAMPLE_STORY = `A young student visited a renowned Zen master, eager to learn the secrets of enlightenment. As they sat down for tea, the master began to pour tea into the student's cup. The cup soon overflowed, and tea spilled onto the table.

"Stop!" the student exclaimed. "The cup is full—no more will go in."

The master smiled gently and replied, "You are like this cup. Your mind is full of your own ideas and preconceptions. How can I show you Zen if you have not first emptied your cup?"

The student realized that to truly learn, he needed to let go of his assumptions. From that day on, he practiced emptying his mind, allowing new insights to fill the space of his awareness.

In Zen, as in life, only when we empty our minds can we truly see and understand the beauty of the world around us.`;

const defaultPreferences: ScenePreferences = {
  genre: 'drama',
  style: 'realistic',
  tone: 'neutral',
  pacing: 'moderate'
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  editorContainer: {
    flex: 1,
    padding: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
  },
  editor: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  input: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 300,
  },
  stepper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepItemActive: {
    transform: [{ scale: 1.1 }],
  },
  stepItemCompleted: {
    opacity: 0.8,
  },
  stepText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  stepConnector: {
    position: 'absolute',
    right: '-50%',
    top: '40%',
    width: '100%',
    height: 2,
    backgroundColor: '#ddd',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  navButton: {
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  navButtonPrimary: {
    backgroundColor: '#007AFF',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 16,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  analysisContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#666',
  },
  characterItem: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 6,
  },
  characterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  characterDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  settingText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  plotPoint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    paddingLeft: 8,
  },
  moralText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  sampleButton: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  sampleButtonText: {
    color: '#666',
    fontSize: 14,
  },
  analyzeButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  twoColumnLayout: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  leftColumn: {
    flex: 1,
    borderRightWidth: 1,
    paddingRight: 16,
  },
  rightColumn: {
    flex: 1,
  },
  analysisScroll: {
    flex: 1,
  },
  characterSection: {
    marginBottom: 16,
  },
  characterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  characterEdit: {
    gap: 8,
  },
  characterInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
  },
  editButton: {
    backgroundColor: '#f0f0f0',
    padding: 4,
    borderRadius: 4,
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 12,
  },
  addCharacter: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    gap: 8,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  navButtonPlaceholder: {
    width: 100,
  },
  navButtonTextPrimary: {
    color: 'white',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  iconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scenesContainer: {
    flex: 1,
  },
  sceneCard: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  sceneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sceneHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sceneTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sceneText: {
    fontSize: 14,
    marginBottom: 16,
  },
  sceneDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    width: 100,
  },
  detailText: {
    flex: 1,
    fontSize: 14,
  },
  retryButton: {
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  preferencesContainer: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    gap: 16,
  },
  preferenceRow: {
    gap: 8,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  generateButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addCharacterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCharacterForm: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  paneHeader: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  paneTitle: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  preferencesToggle: {
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  preferencesToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  preferencesPanel: {
    padding: 16,
    marginBottom: 16,
  },
  scenesList: {
    flex: 1,
  },
  editSceneButton: {
    padding: 4,
    borderRadius: 4,
  },
  sceneInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
  },
  sceneActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  generateImageButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateImageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  imageGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  thumbnailContainer: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnail: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  thumbnailLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    maxWidth: '80%',
    maxHeight: '80%',
  },
  fullImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    borderRadius: 4,
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    width: '75%', // or use dynamic progress
    height: '100%',
    borderRadius: 2,
  },
  sceneDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 12,
  },
  detailInput: {
    flex: 1,
    minWidth: '45%',
  },
  smallInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
    padding: 12,
    borderRadius: 8,
  },
  detailItem: {
    flex: 1,
    minWidth: '45%',
  },
  detailValue: {
    fontSize: 14,
  },
  sceneEditForm: {
    gap: 12,
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default function WorkflowScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const [content, setContent] = useState('');
  const [isSaving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [scriptAnalysis, setScriptAnalysis] = useState<ScriptAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [newCharacter, setNewCharacter] = useState<Character>({ name: '', description: '' });
  const [error, setError] = useState<string | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [isLoadingScenes, setIsLoadingScenes] = useState(false);
  const [sceneError, setSceneError] = useState<string | null>(null);
  const [scenePreferences, setScenePreferences] = useState<ScenePreferences>(defaultPreferences);
  const [showAddCharacter, setShowAddCharacter] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [sceneImages, setSceneImages] = useState<SceneImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<SceneImage | null>(null);
  const [editingScene, setEditingScene] = useState<number | null>(null);
  const [imageSettings, setImageSettings] = useState({
    width: 1080,
    height: 1920,
    resolution: 'high',
    aspectRatio: '9:16'
  });

  const handleNext = async () => {
    if (currentStep < WORKFLOW_STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSave();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const newProject = {
        id: Date.now().toString(),
        title: 'New Script',
        description: content.substring(0, 100) + '...',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      console.log('Created new project:', newProject);
      router.push({
        pathname: "/(tabs)/dashboard",
        params: { id: newProject.id }
      });
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  const analyzeScript = async () => {
    if (!content.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    try {
      const response = await axios.post(
        'https://dl8sa7hwka.execute-api.us-east-1.amazonaws.com/dev/script',
        { story: content },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setScriptAnalysis(response.data);
    } catch (error) {
      setError('Failed to analyze script. Please try again.');
      console.error('Error analyzing script:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdateCharacter = (index: number, updatedCharacter: Character) => {
    if (!scriptAnalysis) return;
    const updatedCharacters = [...scriptAnalysis.characters];
    updatedCharacters[index] = updatedCharacter;
    setScriptAnalysis({ ...scriptAnalysis, characters: updatedCharacters });
    setEditingCharacter(null);
  };

  const handleAddCharacter = () => {
    if (!scriptAnalysis || !newCharacter.name.trim()) return;
    setScriptAnalysis({
      ...scriptAnalysis,
      characters: [...scriptAnalysis.characters, newCharacter]
    });
    setNewCharacter({ name: '', description: '' });
  };

  const fetchScenes = async () => {
    if (!scriptAnalysis || !content) return;
    
    setIsLoadingScenes(true);
    setSceneError(null);
    try {
      const response = await axios.post(
        'https://abi6wff436.execute-api.us-east-1.amazonaws.com/dev/script',
        {
          story: content,
          analysis: scriptAnalysis,
          preferences: {
            genre: scenePreferences.genre,
            style: scenePreferences.style,
            tone: scenePreferences.tone,
            pacing: scenePreferences.pacing
          }
        }
      );
      setScenes(response.data);
    } catch (error) {
      setSceneError('Failed to generate scenes. Please try again.');
      console.error('Error generating scenes:', error);
    } finally {
      setIsLoadingScenes(false);
    }
  };

  useEffect(() => {
    // Remove the fetchScenes() call from here
    // Other step-specific initialization can stay
  }, [currentStep]);

  const updateScene = (index: number, updatedScene: Scene | Scene[]) => {
    if (Array.isArray(updatedScene)) {
      setScenes(updatedScene);
    } else {
      setScenes(prev => {
        const newScenes = [...prev];
    newScenes[index] = updatedScene;
        return newScenes;
      });
    }
  };

  const generateImage = async (scene: Scene) => {
    // TODO: Implement image generation API call
    // For now, using placeholder image
    const newImage: SceneImage = {
      url: 'https://via.placeholder.com/300',
      sceneIndex: scenes.indexOf(scene)
    };
    setSceneImages([...sceneImages, newImage]);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ScriptEditor 
            content={content}
            setContent={setContent}
            scriptAnalysis={scriptAnalysis}
            isAnalyzing={isAnalyzing}
            onAnalyze={analyzeScript}
            onNext={() => setCurrentStep(2)}
          />
        );
      case 2:
        return (
          <SceneGenerator 
            scenes={scenes}
            scenePreferences={scenePreferences}
            scriptAnalysis={scriptAnalysis}
            content={content}
            onNext={() => setCurrentStep(3)}
            onUpdateScene={(index, updatedScenes) => setScenes(updatedScenes)}
            onGenerateImage={generateImage}
            imageSettings={imageSettings}
            onUpdateImageSettings={setImageSettings}
          />
        );
      case 3:
        return <AudioSelector content={content} />;
      case 4:
        return <CaptionEditor />;
      case 5:
        return <MovieRenderer />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <WorkflowStepper currentStep={currentStep} onStepChange={setCurrentStep} />
      <View style={styles.content}>
        {renderStepContent()}
      </View>
    </View>
  );
}

const ProgressBar = ({ progress }: { progress: number }) => (
  <View style={[styles.progressBar, { width: `${progress}%` }]} />
);
