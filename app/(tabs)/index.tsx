import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Modal, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useTheme } from '../../src/theme/ThemeContext';

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
  sceneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
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

export default function Home() {
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
      router.push('/dashboard/' + newProject.id);
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
    if (currentStep === 2) {
      fetchScenes();
    }
  }, [currentStep]);

  const updateScene = (index: number, updatedScene: Scene) => {
    const newScenes = [...scenes];
    newScenes[index] = updatedScene;
    setScenes(newScenes);
    setEditingScene(null);
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
          <>
            <View style={styles.twoColumnLayout}>
              <View style={[styles.leftColumn, { borderRightColor: theme.border }]}>
                <View style={styles.paneHeader}>
                  <Text style={[styles.paneTitle, { color: theme.textSecondary }]}>
                    Script Editor
                  </Text>
                </View>
                <ScrollView style={[styles.editor, { backgroundColor: theme.card }]}>
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    multiline
                    value={content}
                    onChangeText={setContent}
                    placeholder="Enter your script content here..."
                    textAlignVertical="top"
                    placeholderTextColor={theme.textSecondary}
                  />
                </ScrollView>

                <TouchableOpacity 
                  style={[styles.preferencesToggle, { backgroundColor: theme.buttonBg }]}
                  onPress={() => setShowPreferences(!showPreferences)}
                >
                  <Text style={[styles.preferencesToggleText, { color: theme.text }]}>
                    {showPreferences ? 'Hide Preferences' : 'Show Scene Preferences'}
                  </Text>
                  <Ionicons 
                    name={showPreferences ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    color={theme.text}
                  />
                </TouchableOpacity>

                {showPreferences && (
                  <View style={[styles.preferencesPanel, { backgroundColor: theme.card }]}>
                    <View style={styles.preferenceRow}>
                      <Text style={[styles.preferenceLabel, { color: theme.textSecondary }]}>Genre:</Text>
                      <View style={styles.optionsRow}>
                        {['drama', 'comedy', 'action', 'thriller', 'romance'].map((genre) => (
                          <TouchableOpacity
                            key={genre}
                            style={[
                              styles.optionButton,
                              { backgroundColor: theme.buttonBg },
                              scenePreferences.genre === genre && { 
                                backgroundColor: theme.primary,
                                borderColor: theme.primary 
                              }
                            ]}
                            onPress={() => setScenePreferences({ ...scenePreferences, genre })}
                          >
                            <Text style={[
                              styles.optionText,
                              { color: theme.buttonText },
                              scenePreferences.genre === genre && { color: 'white' }
                            ]}>
                              {genre.charAt(0).toUpperCase() + genre.slice(1)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View style={styles.preferenceRow}>
                      <Text style={[styles.preferenceLabel, { color: theme.textSecondary }]}>Style:</Text>
                      <View style={styles.optionsRow}>
                        {['realistic', 'stylized', 'minimalist', 'cinematic'].map((style) => (
                          <TouchableOpacity
                            key={style}
                            style={[
                              styles.optionButton,
                              { backgroundColor: theme.buttonBg },
                              scenePreferences.style === style && { 
                                backgroundColor: theme.primary,
                                borderColor: theme.primary 
                              }
                            ]}
                            onPress={() => setScenePreferences({ ...scenePreferences, style })}
                          >
                            <Text style={[
                              styles.optionText,
                              { color: theme.buttonText },
                              scenePreferences.style === style && { color: 'white' }
                            ]}>
                              {style.charAt(0).toUpperCase() + style.slice(1)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View style={styles.preferenceRow}>
                      <Text style={[styles.preferenceLabel, { color: theme.textSecondary }]}>Tone:</Text>
                      <View style={styles.optionsRow}>
                        {['light', 'neutral', 'dark', 'intense'].map((tone) => (
                          <TouchableOpacity
                            key={tone}
                            style={[
                              styles.optionButton,
                              { backgroundColor: theme.buttonBg },
                              scenePreferences.tone === tone && { 
                                backgroundColor: theme.primary,
                                borderColor: theme.primary 
                              }
                            ]}
                            onPress={() => setScenePreferences({ ...scenePreferences, tone })}
                          >
                            <Text style={[
                              styles.optionText,
                              { color: theme.buttonText },
                              scenePreferences.tone === tone && { color: 'white' }
                            ]}>
                              {tone.charAt(0).toUpperCase() + tone.slice(1)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View style={styles.preferenceRow}>
                      <Text style={[styles.preferenceLabel, { color: theme.textSecondary }]}>Pacing:</Text>
                      <View style={styles.optionsRow}>
                        {['slow', 'moderate', 'fast', 'dynamic'].map((pacing) => (
                          <TouchableOpacity
                            key={pacing}
                            style={[
                              styles.optionButton,
                              { backgroundColor: theme.buttonBg },
                              scenePreferences.pacing === pacing && { 
                                backgroundColor: theme.primary,
                                borderColor: theme.primary 
                              }
                            ]}
                            onPress={() => setScenePreferences({ ...scenePreferences, pacing })}
                          >
                            <Text style={[
                              styles.optionText,
                              { color: theme.buttonText },
                              scenePreferences.pacing === pacing && { color: 'white' }
                            ]}>
                              {pacing.charAt(0).toUpperCase() + pacing.slice(1)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                )}

                <TouchableOpacity 
                  style={[styles.analyzeButton, !content.trim() && styles.buttonDisabled]}
                  onPress={analyzeScript}
                  disabled={!content.trim() || isAnalyzing}
                >
                  <Text style={styles.analyzeButtonText}>
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Script'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.rightColumn}>
                {scriptAnalysis && (
                  <>
                    <View style={styles.paneHeader}>
                      <Text style={[styles.paneTitle, { color: theme.textSecondary }]}>
                        Analysis Results
                      </Text>
                    </View>
                    <ScrollView style={[styles.analysisScroll, { backgroundColor: theme.background }]}>
                      <View style={[styles.analysisContainer, { 
                        backgroundColor: theme.card,
                        borderColor: theme.border 
                      }]}>
                        <Text style={styles.analysisTitle}>{scriptAnalysis.story_title}</Text>
                        
                        <View style={styles.characterSection}>
                          <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Characters:</Text>
                            <TouchableOpacity 
                              style={[styles.addCharacterButton, { backgroundColor: theme.buttonBg }]}
                              onPress={() => setShowAddCharacter(!showAddCharacter)}
                            >
                              <Ionicons 
                                name={showAddCharacter ? 'close' : 'add'} 
                                size={20} 
                                color={theme.buttonText}
                              />
                            </TouchableOpacity>
                          </View>

                          {showAddCharacter && (
                            <View style={[styles.addCharacterForm, { 
                              backgroundColor: theme.card,
                              borderColor: theme.border 
                            }]}>
                              <TextInput
                                style={[styles.characterInput, { 
                                  backgroundColor: theme.background,
                                  color: theme.text,
                                  borderColor: theme.border 
                                }]}
                                value={newCharacter.name}
                                onChangeText={(text) => setNewCharacter({ ...newCharacter, name: text })}
                                placeholder="New character name"
                                placeholderTextColor={theme.textSecondary}
                              />
                              <TextInput
                                style={[styles.characterInput, { 
                                  backgroundColor: theme.background,
                                  color: theme.text,
                                  borderColor: theme.border 
                                }]}
                                value={newCharacter.description}
                                onChangeText={(text) => setNewCharacter({ ...newCharacter, description: text })}
                                placeholder="New character description"
                                placeholderTextColor={theme.textSecondary}
                              />
                              <TouchableOpacity 
                                style={[styles.addButton, !newCharacter.name.trim() && styles.buttonDisabled]}
                                onPress={handleAddCharacter}
                                disabled={!newCharacter.name.trim()}
                              >
                                <Text style={styles.addButtonText}>Add Character</Text>
                              </TouchableOpacity>
                            </View>
                          )}

                          {scriptAnalysis.characters.map((char, index) => (
                            <View key={index} style={styles.characterItem}>
                              {editingCharacter === char ? (
                                <View style={styles.characterEdit}>
                                  <TextInput
                                    style={styles.characterInput}
                                    value={char.name}
                                    onChangeText={(text) => {
                                      const updated = { ...char, name: text };
                                      handleUpdateCharacter(index, updated);
                                    }}
                                    placeholder="Character name"
                                    placeholderTextColor={theme.textSecondary}
                                  />
                                  <TextInput
                                    style={styles.characterInput}
                                    value={char.description}
                                    onChangeText={(text) => {
                                      const updated = { ...char, description: text };
                                      handleUpdateCharacter(index, updated);
                                    }}
                                    placeholder="Character description"
                                    placeholderTextColor={theme.textSecondary}
                                  />
                                  <TouchableOpacity 
                                    style={[styles.iconButton, { backgroundColor: theme.buttonBg }]}
                                    onPress={() => setEditingCharacter(null)}
                                  >
                                    <Ionicons name="checkmark" size={16} color={theme.primary} />
                                  </TouchableOpacity>
                                </View>
                              ) : (
                                <>
                                  <View style={styles.characterHeader}>
                                    <Text style={styles.characterName}>{char.name}</Text>
                                    <TouchableOpacity 
                                      style={[styles.iconButton, { backgroundColor: theme.buttonBg }]}
                                      onPress={() => setEditingCharacter(char)}
                                    >
                                      <Ionicons name="pencil" size={16} color={theme.buttonText} />
                                    </TouchableOpacity>
                                  </View>
                                  <Text style={styles.characterDesc}>{char.description}</Text>
                                </>
                              )}
                            </View>
                          ))}
                        </View>

                        <Text style={styles.sectionTitle}>Setting:</Text>
                        <Text style={styles.settingText}>
                          Location: {scriptAnalysis.setting.location}
                        </Text>
                        <Text style={styles.settingText}>
                          Time: {scriptAnalysis.setting.time}
                        </Text>

                        <Text style={styles.sectionTitle}>Plot Points:</Text>
                        {scriptAnalysis.plot.map((point, index) => (
                          <Text key={index} style={styles.plotPoint}>• {point}</Text>
                        ))}

                        <Text style={styles.sectionTitle}>Moral:</Text>
                        <Text style={styles.moralText}>{scriptAnalysis.moral}</Text>
                      </View>
                    </ScrollView>
                  </>
                )}
              </View>
            </View>
            
            <View style={styles.navigation}>
              <View style={styles.navButtonPlaceholder} />
              {scriptAnalysis && (
                <TouchableOpacity 
                  style={[styles.navButton, styles.navButtonPrimary]}
                  onPress={() => setCurrentStep(2)}
                >
                  <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>
                    Next →
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        );
      case 2:
        return (
          <View style={styles.twoColumnLayout}>
            <View style={[styles.leftColumn, { flex: 2, borderRightColor: theme.border }]}>
              <View style={styles.paneHeader}>
                <Text style={[styles.paneTitle, { color: theme.textSecondary }]}>
                  Scenes
                </Text>
              </View>
              
              {isLoadingScenes ? (
                <View style={[styles.loadingOverlay, { backgroundColor: theme.background }]}>
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { backgroundColor: theme.primary }]} />
                  </View>
                  <Text style={[styles.loadingText, { color: theme.text }]}>
                    Generating scenes...
                  </Text>
                </View>
              ) : (
                <ScrollView style={styles.scenesList}>
                  {scenes.map((scene, index) => (
                    <View key={index} style={[styles.sceneCard, { backgroundColor: theme.card }]}>
                      <View style={styles.sceneHeader}>
                        <Text style={[styles.sceneTitle, { color: theme.text }]}>
                          Scene {index + 1}
                        </Text>
                        <View style={styles.sceneActions}>
                          <TouchableOpacity 
                            style={[styles.generateImageButton, { backgroundColor: '#dc2626' }]}
                            onPress={() => generateImage(scene)}
                          >
                            <Ionicons name="image" size={16} color="white" />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.editSceneButton}
                            onPress={() => setEditingScene(index)}
                          >
                            <Ionicons name="pencil" size={16} color={theme.primary} />
                          </TouchableOpacity>
                        </View>
                      </View>
                      
                      {editingScene === index ? (
                        <View style={styles.sceneEditForm}>
                          <TextInput
                            style={[styles.sceneInput, { color: theme.text }]}
                            multiline
                            value={scene.scene}
                            onChangeText={(text) => updateScene(index, { ...scene, scene: text })}
                            placeholder="Scene description..."
                            placeholderTextColor={theme.textSecondary}
                          />
                          
                          <View style={styles.sceneDetailsGrid}>
                            <View style={styles.detailInput}>
                              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Setting</Text>
                              <TextInput
                                style={[styles.smallInput, { color: theme.text }]}
                                value={scene.setting}
                                onChangeText={(text) => updateScene(index, { ...scene, setting: text })}
                                placeholder="Scene setting"
                                placeholderTextColor={theme.textSecondary}
                              />
                            </View>

                            <View style={styles.detailInput}>
                              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Time</Text>
                              <TextInput
                                style={[styles.smallInput, { color: theme.text }]}
                                value={scene.time_of_day}
                                onChangeText={(text) => updateScene(index, { ...scene, time_of_day: text })}
                                placeholder="Time of day"
                                placeholderTextColor={theme.textSecondary}
                              />
                            </View>

                            <View style={styles.detailInput}>
                              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Mood</Text>
                              <TextInput
                                style={[styles.smallInput, { color: theme.text }]}
                                value={scene.mood}
                                onChangeText={(text) => updateScene(index, { ...scene, mood: text })}
                                placeholder="Scene mood"
                                placeholderTextColor={theme.textSecondary}
                              />
                            </View>

                            <View style={styles.detailInput}>
                              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Expression</Text>
                              <TextInput
                                style={[styles.smallInput, { color: theme.text }]}
                                value={scene.expressiveness}
                                onChangeText={(text) => updateScene(index, { ...scene, expressiveness: text })}
                                placeholder="Expressiveness"
                                placeholderTextColor={theme.textSecondary}
                              />
                            </View>
                          </View>

                          <TextInput
                            style={[styles.sceneInput, { color: theme.text }]}
                            multiline
                            value={scene.visual_details}
                            onChangeText={(text) => updateScene(index, { ...scene, visual_details: text })}
                            placeholder="Visual details..."
                            placeholderTextColor={theme.textSecondary}
                          />
                        </View>
                      ) : (
                        <View style={styles.sceneDetails}>
                          <Text style={[styles.sceneText, { color: theme.text }]}>
                            {scene.scene}
                          </Text>
                          
                          <View style={styles.detailsGrid}>
                            <View style={styles.detailItem}>
                              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Setting</Text>
                              <Text style={[styles.detailValue, { color: theme.text }]}>{scene.setting}</Text>
                            </View>
                            <View style={styles.detailItem}>
                              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Time</Text>
                              <Text style={[styles.detailValue, { color: theme.text }]}>{scene.time_of_day}</Text>
                            </View>
                            <View style={styles.detailItem}>
                              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Mood</Text>
                              <Text style={[styles.detailValue, { color: theme.text }]}>{scene.mood}</Text>
                            </View>
                            <View style={styles.detailItem}>
                              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Expression</Text>
                              <Text style={[styles.detailValue, { color: theme.text }]}>{scene.expressiveness}</Text>
                            </View>
                          </View>

                          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Visual Details</Text>
                          <Text style={[styles.detailValue, { color: theme.text }]}>{scene.visual_details}</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>

            <View style={[styles.rightColumn, { flex: 1 }]}>
              <View style={styles.paneHeader}>
                <Text style={[styles.paneTitle, { color: theme.textSecondary }]}>
                  Scene Visualizations
                </Text>
              </View>

              <ScrollView style={styles.imageGrid}>
                {sceneImages.map((image, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.thumbnailContainer, { marginBottom: 8 }]}
                    onPress={() => setSelectedImage(image)}
                  >
                    <Image 
                      source={{ uri: image.url }}
                      style={styles.thumbnail}
                    />
                    <Text style={[styles.thumbnailLabel, { color: theme.textSecondary }]}>
                      Scene {index + 1}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {selectedImage && (
              <Modal
                visible={!!selectedImage}
                transparent
                onRequestClose={() => setSelectedImage(null)}
              >
                <View style={styles.modalOverlay}>
                  <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                    <Image 
                      source={{ uri: selectedImage.url }}
                      style={styles.fullImage}
                      resizeMode="contain"
                    />
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setSelectedImage(null)}
                    >
                      <Ionicons name="close" size={24} color={theme.text} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            )}
          </View>
        );
      case 3:
        return (
          <>
            <Text style={styles.subtitle}>Audio Selection</Text>
            <View style={[styles.placeholderContent, { backgroundColor: theme.card }]}>
              <Ionicons name="musical-notes" size={48} color={theme.textSecondary} />
              <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
                Voice selection will be available after scenes are set
              </Text>
            </View>
          </>
        );
      case 4:
        return (
          <>
            <Text style={styles.subtitle}>Caption Styling</Text>
            <View style={[styles.placeholderContent, { backgroundColor: theme.card }]}>
              <Ionicons name="text" size={48} color={theme.textSecondary} />
              <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
                Caption editor will be available after audio is selected
              </Text>
            </View>
          </>
        );
      case 5:
        return (
          <>
            <Text style={styles.subtitle}>Render Movie</Text>
            <View style={[styles.placeholderContent, { backgroundColor: theme.card }]}>
              <Ionicons name="film" size={48} color={theme.textSecondary} />
              <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
                Ready to render your movie
              </Text>
            </View>
          </>
        );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { 
        borderBottomColor: theme.border,
        backgroundColor: theme.background,
      }]}>
        <Text style={[styles.title, { color: theme.text }]}>MediaGen</Text>
        <TouchableOpacity 
          style={[styles.iconButton, { backgroundColor: theme.buttonBg }]}
          onPress={toggleTheme}
        >
          <Ionicons 
            name={isDark ? 'sunny' : 'moon'} 
            size={24} 
            color={theme.buttonText} 
          />
        </TouchableOpacity>
      </View>

      <View style={[styles.stepper, { 
        backgroundColor: theme.background,
        borderBottomColor: theme.border 
      }]}>
        {WORKFLOW_STEPS.map((step) => (
          <View 
            key={step.id} 
            style={[
              styles.stepItem,
              currentStep === step.id && styles.stepItemActive,
              currentStep > step.id && styles.stepItemCompleted,
            ]}
          >
            <Ionicons 
              name={step.icon as any} 
              size={24} 
              color={currentStep >= step.id 
                ? step.color 
                : isDark 
                  ? 'rgba(255,255,255,0.3)' 
                  : 'rgba(0,0,0,0.3)'
              } 
            />
            <Text style={[
              styles.stepText,
              { color: theme.textSecondary },
              currentStep >= step.id && { color: theme.primary }
            ]}>
              {step.title}
            </Text>
            {step.id < WORKFLOW_STEPS.length && (
              <View style={[
                styles.stepConnector,
                { backgroundColor: theme.border },
                currentStep > step.id && { backgroundColor: theme.primary }
              ]} />
            )}
          </View>
        ))}
      </View>

      <View style={styles.editorContainer}>
        {renderStepContent()}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        {isAnalyzing && (
          <View style={[styles.loadingContainer, { 
            backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)' 
          }]}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={{ marginTop: 8, color: theme.text }}>
              Analyzing script...
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const ProgressBar = ({ progress }: { progress: number }) => (
  <View style={[styles.progressBar, { width: `${progress}%` }]} />
);
