import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { Scene } from '../../types/Scene';
import axios from 'axios';
import { SceneCard } from './SceneCard';

interface ImageSettings {
  width: number;
  height: number;
  aspectRatio: string;
  engine: 'titan-generator' | 'nova-canvas';
}

interface SceneGeneratorProps {
  scenes: Scene[];
  scenePreferences: any;
  scriptAnalysis: any;
  content: string;
  onNext: () => void;
  onUpdateScene: (index: number, scenes: Scene[] | Scene) => void;
  onGenerateImage: (scene: Scene, index: number, settings: ImageSettings) => void;
}

interface EditableScene extends Scene {
  isEditing?: boolean;
}

const MAX_IMAGE_HEIGHT = 1408; // AWS Bedrock limitation
const MAX_IMAGE_WIDTH = 2048; // Common width limit

export function SceneGenerator({
  scenes,
  scenePreferences,
  scriptAnalysis,
  content,
  onNext,
  onUpdateScene,
  onGenerateImage,
}: SceneGeneratorProps) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingImages, setLoadingImages] = useState<{ [key: number]: boolean }>({});
  const [localScenes, setLocalScenes] = useState<Scene[]>([]);
  const [editingSceneIndex, setEditingSceneIndex] = useState<number | null>(null);
  const [showImageSettings, setShowImageSettings] = useState(false);
  const [imageSettings, setImageSettings] = useState<ImageSettings>({
    width: 768,
    height: 1152,
    aspectRatio: '3:2',
    engine: 'titan-generator'
  });

  const aspectRatios = [
    { label: 'Square (1:1)', value: '1:1', width: 1024, height: 1024 },
    { label: 'Portrait (3:2)', value: '3:2', width: 768, height: 1152 },
    { label: 'Landscape (3:2)', value: '3:2', width: 1152, height: 768 },
    { label: 'Wide (16:9)', value: '16:9', width: 1792, height: 1024 },
    { label: 'Tall (9:16)', value: '9:16', width: 1024, height: 1792 },
  ];

  useEffect(() => {
    if (!localScenes.length && content && scriptAnalysis) {
      generateScenes();
    }
  }, [content, scriptAnalysis]);

  useEffect(() => {
    if (scenes && Array.isArray(scenes)) {
      setLocalScenes(scenes);
    }
  }, [scenes]);

  const generateScenes = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        'https://abi6wff436.execute-api.us-east-1.amazonaws.com/dev/script',
        {
          story: content,
          analysis: scriptAnalysis,
          preferences: scenePreferences
        }
      );
      
      if (response.data) {
        const newScenes = Array.isArray(response.data) ? response.data : [response.data];
        setLocalScenes(newScenes);
        onUpdateScene(0, newScenes);
      }
    } catch (error) {
      console.error('Error generating scenes:', error);
      setError('Failed to generate scenes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateScene = (index: number, updatedScene: Scene) => {
    setLocalScenes(prev => {
      const updated = [...prev];
      updated[index] = updatedScene;
      return updated;
    });
    onUpdateScene(index, updatedScene);
  };

  const handleGenerateImage = async (scene: Scene, index: number) => {
    const currentCount = scene.generatedImageCount || 0;
    if (currentCount >= 3) {
      setError('You have reached the maximum limit of 3 images for this scene.');
      return;
    }

    setLoadingImages(prev => ({ ...prev, [index]: true }));
    
    try {
      const response = await axios.post(
        'https://wcy9t2rlbh.execute-api.us-east-1.amazonaws.com/dev/script',
        {
          ...scene,
          imageSettings: {
            width: imageSettings.width,
            height: imageSettings.height,
            engine: imageSettings.engine
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data.status === 'success') {
        const imageUrls = scene.imageUrls || [];
        imageUrls.push(response.data.image_url);
        
        const updatedScene = { 
          ...scene, 
          imageUrls,
          generatedImageCount: currentCount + 1
        };
        handleUpdateScene(index, updatedScene);
      }
    } catch (error) {
      console.error('Error generating image:', error);
      setError('Failed to generate image. Please try again.');
    } finally {
      setLoadingImages(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleEditScene = (index: number) => {
    setEditingSceneIndex(index);
  };

  const handleSceneFieldUpdate = (index: number, field: keyof Scene, value: string) => {
    setLocalScenes(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const saveSceneEdits = (index: number) => {
    const updatedScene = localScenes[index];
    onUpdateScene(index, updatedScene);
    setEditingSceneIndex(null);
  };

  const handleAspectRatioChange = (ratio: typeof aspectRatios[0]) => {
    setImageSettings(prev => ({
      ...prev,
      aspectRatio: ratio.value,
      width: ratio.width,
      height: ratio.height,
    }));
  };

  const renderImageSettingsToolbar = () => (
    <View style={[styles.settingsToolbar, { backgroundColor: theme.card }]}>
      <View style={styles.toolbarContent}>
        <View style={styles.toolbarSection}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Engine:</Text>
          <View style={styles.engineOptions}>
            <TouchableOpacity
              style={[
                styles.engineOption,
                imageSettings.engine === 'titan-generator' && { backgroundColor: theme.primary }
              ]}
              onPress={() => setImageSettings(prev => ({ ...prev, engine: 'titan-generator' }))}
            >
              <Text style={[
                styles.engineOptionText,
                imageSettings.engine === 'titan-generator' && { color: '#fff' }
              ]}>Titan</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.engineOption,
                imageSettings.engine === 'nova-canvas' && { backgroundColor: theme.primary }
              ]}
              onPress={() => setImageSettings(prev => ({ ...prev, engine: 'nova-canvas' }))}
            >
              <Text style={[
                styles.engineOptionText,
                imageSettings.engine === 'nova-canvas' && { color: '#fff' }
              ]}>Nova</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.toolbarDivider} />

        <View style={styles.toolbarSection}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Format:</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.aspectRatioScroll}
          >
            {aspectRatios.map(ratio => (
              <TouchableOpacity
                key={ratio.value}
                style={[
                  styles.aspectRatioChip,
                  imageSettings.width === ratio.width && 
                  imageSettings.height === ratio.height && 
                  { backgroundColor: theme.primary }
                ]}
                onPress={() => handleAspectRatioChange(ratio)}
              >
                <Text style={[
                  styles.chipText,
                  imageSettings.width === ratio.width && 
                  imageSettings.height === ratio.height && 
                  { color: '#fff' }
                ]}>{ratio.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );

  const renderSceneCard = (scene: Scene, index: number) => (
    <View key={index} style={[styles.sceneCard, { backgroundColor: theme.card }]}>
      <View style={styles.cardContent}>
        {/* Left side - Scene details */}
        <View style={styles.sceneDetails}>
          <View style={styles.sceneHeader}>
            {editingSceneIndex === index ? (
              <TextInput
                style={[styles.editInput, { color: theme.text }]}
                value={scene.setting}
                onChangeText={(value) => handleSceneFieldUpdate(index, 'setting', value)}
                placeholder="Scene setting"
              />
            ) : (
              <Text style={[styles.sceneTitle, { color: theme.text }]}>
                Scene {index + 1}: {scene.setting}
              </Text>
            )}
            <View style={styles.sceneActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.buttonBg }]}
                onPress={() => handleEditScene(index)}
              >
                <Ionicons 
                  name={editingSceneIndex === index ? "save" : "pencil"} 
                  size={20} 
                  color={theme.primary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.detailsGrid}>
            {[
              { label: 'Scene Description', field: 'scene' },
              { label: 'Time', field: 'time_of_day' },
              { label: 'Background', field: 'background' },
              { label: 'Mood', field: 'mood' },
              { label: 'Expression', field: 'expressiveness' },
              { label: 'Visual Details', field: 'visual_details' }
            ].map(({ label, field }) => (
              <View key={field} style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>{label}:</Text>
                {editingSceneIndex === index ? (
                  <TextInput
                    style={[styles.editInput, { color: theme.text, flex: 1 }]}
                    value={scene[field as keyof Scene] as string}
                    onChangeText={(value) => handleSceneFieldUpdate(index, field as keyof Scene, value)}
                    multiline={field === 'visual_details'}
                  />
                ) : (
                  <Text style={[styles.detailText, { color: theme.text, flex: 1 }]}>
                    {scene[field as keyof Scene]}
                  </Text>
                )}
              </View>
            ))}
          </View>

          {editingSceneIndex === index && (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={[styles.editActionButton, { backgroundColor: theme.primary }]}
                onPress={() => saveSceneEdits(index)}
              >
                <Text style={styles.editActionButtonText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editActionButton, { backgroundColor: theme.buttonBg }]}
                onPress={() => setEditingSceneIndex(null)}
              >
                <Text style={[styles.editActionButtonText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Right side - Images */}
        <View style={styles.imageSection}>
          <View style={styles.imageHeader}>
            <Text style={[styles.imageCount, { color: theme.textSecondary }]}>
              Images: {scene.generatedImageCount || 0}/3
            </Text>
          </View>
          {scene.imageUrls && scene.imageUrls.length > 0 ? (
            <ScrollView horizontal style={styles.imageScroll}>
              {scene.imageUrls.map((url, imgIndex) => (
                <Image 
                  key={imgIndex}
                  source={{ uri: url }} 
                  style={styles.sceneImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: theme.buttonBg }]}>
              <TouchableOpacity
                style={[styles.generateImageButton, { backgroundColor: theme.primary }]}
                onPress={() => handleGenerateImage(scene, index)}
                disabled={loadingImages[index]}
              >
                {loadingImages[index] ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="image" size={20} color="white" />
                    <Text style={styles.generateImageText}>Generate Image</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderNavigation = () => (
    <View style={styles.header}>
      <Text style={[styles.headerTitle, { color: theme.text }]}>Scene Generation</Text>
      <TouchableOpacity
        style={[styles.nextButton, { backgroundColor: theme.primary }]}
        onPress={onNext}
      >
        <Text style={styles.nextButtonText}>Next: Audio Selection</Text>
        <Ionicons name="arrow-forward" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );

  const renderEditModal = () => {
    if (editingSceneIndex === null) return null;
    
    const scene = localScenes[editingSceneIndex];
    
    return (
      <Modal
        visible={editingSceneIndex !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingSceneIndex(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Scene</Text>
              <TouchableOpacity onPress={() => setEditingSceneIndex(null)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.formScrollView}>
              <View style={styles.formContainer}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Scene Description</Text>
                <TextInput
                  style={[styles.textInput, { color: theme.text, borderColor: theme.border }]}
                  value={scene.scene}
                  onChangeText={(value) => handleSceneFieldUpdate(editingSceneIndex, 'scene', value)}
                  multiline
                  numberOfLines={3}
                />
                
                <Text style={[styles.inputLabel, { color: theme.text }]}>Setting</Text>
                <TextInput
                  style={[styles.textInput, { color: theme.text, borderColor: theme.border }]}
                  value={scene.setting}
                  onChangeText={(value) => handleSceneFieldUpdate(editingSceneIndex, 'setting', value)}
                />
                
                <Text style={[styles.inputLabel, { color: theme.text }]}>Time of Day</Text>
                <TextInput
                  style={[styles.textInput, { color: theme.text, borderColor: theme.border }]}
                  value={scene.time_of_day}
                  onChangeText={(value) => handleSceneFieldUpdate(editingSceneIndex, 'time_of_day', value)}
                />
                
                <Text style={[styles.inputLabel, { color: theme.text }]}>Background</Text>
                <TextInput
                  style={[styles.textInput, { color: theme.text, borderColor: theme.border }]}
                  value={scene.background}
                  onChangeText={(value) => handleSceneFieldUpdate(editingSceneIndex, 'background', value)}
                />
                
                <Text style={[styles.inputLabel, { color: theme.text }]}>Mood</Text>
                <TextInput
                  style={[styles.textInput, { color: theme.text, borderColor: theme.border }]}
                  value={scene.mood}
                  onChangeText={(value) => handleSceneFieldUpdate(editingSceneIndex, 'mood', value)}
                />
                
                <Text style={[styles.inputLabel, { color: theme.text }]}>Expressiveness</Text>
                <TextInput
                  style={[styles.textInput, { color: theme.text, borderColor: theme.border }]}
                  value={scene.expressiveness}
                  onChangeText={(value) => handleSceneFieldUpdate(editingSceneIndex, 'expressiveness', value)}
                />
                
                <Text style={[styles.inputLabel, { color: theme.text }]}>Visual Details</Text>
                <TextInput
                  style={[styles.textInput, { color: theme.text, borderColor: theme.border, height: 80 }]}
                  value={scene.visual_details}
                  onChangeText={(value) => handleSceneFieldUpdate(editingSceneIndex, 'visual_details', value)}
                  multiline
                />
              </View>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.cancelButton, { borderColor: theme.border }]}
                onPress={() => setEditingSceneIndex(null)}
              >
                <Text style={{ color: theme.text }}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: theme.primary }]}
                onPress={() => saveSceneEdits(editingSceneIndex)}
              >
                <Text style={{ color: '#fff' }}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {renderNavigation()}
      
      {renderImageSettingsToolbar()}
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ color: theme.text }}>Generating scenes...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scenesList}>
          {localScenes.map((scene, index) => renderSceneCard(scene, index))}
        </ScrollView>
      )}
      {renderEditModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scenesList: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sceneCard: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
  },
  cardContent: {
    flexDirection: 'row',
    gap: 16,
  },
  sceneDetails: {
    flex: 1,
  },
  sceneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sceneTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  detailsGrid: {
    marginTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    marginRight: 8,
    fontWeight: '500',
  },
  detailText: {
    fontSize: 14,
  },
  editInput: {
    fontSize: 14,
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  editActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editActionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  imageSection: {
    width: 200,
    aspectRatio: 3/4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  generateImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  sceneImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  sceneActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  imageScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 16,
    borderRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    width: '48%',
    alignItems: 'center',
  },
  saveButton: {
    padding: 10,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  formScrollView: {
    maxHeight: 200,
  },
  formContainer: {
    padding: 16,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingsToolbar: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  toolbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  toolbarSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  engineOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  engineOption: {
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  engineOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  toolbarDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  aspectRatioScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  aspectRatioChip: {
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  imageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
}); 