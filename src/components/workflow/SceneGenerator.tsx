import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { Scene, ScenePreferences } from '../../types/Scene';
import axios from 'axios';
import { SceneCard } from './SceneCard';

interface ImageSettings {
  width: number;
  height: number;
  resolution: 'low' | 'medium' | 'high';
  aspectRatio: string;
}

interface SceneGeneratorProps {
  scenes: Scene[];
  scenePreferences: ScenePreferences;
  scriptAnalysis: any;
  content: string;
  onNext: () => void;
  onUpdateScene: (index: number, scene: Scene) => void;
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
    resolution: 'high',
    aspectRatio: '3:2',
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
    setLoadingImages(prev => ({ ...prev, [index]: true }));
    
    try {
      const response = await axios.post(
        'https://wcy9t2rlbh.execute-api.us-east-1.amazonaws.com/dev/script',
        {
          ...scene,
          imageSettings: {
            width: imageSettings.width,
            height: imageSettings.height,
            resolution: imageSettings.resolution
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data.status === 'success') {
        const updatedScene = { ...scene, imageUrl: response.data.image_url };
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

  const renderSceneCard = (scene: Scene, index: number) => (
    <View key={index} style={[styles.sceneCard, { backgroundColor: theme.card }]}>
      <View style={styles.cardContent}>
        {/* Left side - Scene details */}
        <View style={styles.sceneDetails}>
          <View style={styles.sceneHeader}>
            {editingSceneIndex === index ? (
              <TextInput
                style={[styles.editInput, { color: theme.text }]}
                value={scene.scene}
                onChangeText={(value) => handleSceneFieldUpdate(index, 'scene', value)}
                placeholder="Scene title"
              />
            ) : (
              <Text style={[styles.sceneTitle, { color: theme.text }]}>
                Scene {index + 1}: {scene.scene}
              </Text>
            )}
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: theme.buttonBg }]}
              onPress={() => handleEditScene(index)}
            >
              <Ionicons 
                name={editingSceneIndex === index ? "save" : "pencil"} 
                size={20} 
                color={theme.primary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.detailsGrid}>
            {[
              { label: 'Setting', field: 'setting' },
              { label: 'Time', field: 'time_of_day' },
              { label: 'Mood', field: 'mood' },
              { label: 'Expression', field: 'expressiveness' }
            ].map(({ label, field }) => (
              <View key={field} style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>{label}:</Text>
                {editingSceneIndex === index ? (
                  <TextInput
                    style={[styles.editInput, { color: theme.text }]}
                    value={scene[field as keyof Scene] as string}
                    onChangeText={(value) => handleSceneFieldUpdate(index, field as keyof Scene, value)}
                  />
                ) : (
                  <Text style={[styles.detailText, { color: theme.text }]}>
                    {scene[field as keyof Scene]}
                  </Text>
                )}
              </View>
            ))}
          </View>

          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Visual Details:</Text>
          {editingSceneIndex === index ? (
            <TextInput
              style={[styles.editInput, { color: theme.text, height: 80 }]}
              value={scene.visual_details}
              onChangeText={(value) => handleSceneFieldUpdate(index, 'visual_details', value)}
              multiline
            />
          ) : (
            <Text style={[styles.detailText, { color: theme.text }]}>{scene.visual_details}</Text>
          )}

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

        {/* Right side - Image */}
        <View style={styles.imageSection}>
          {scene.imageUrl ? (
            <Image 
              source={{ uri: scene.imageUrl }} 
              style={styles.sceneImage}
              resizeMode="cover"
            />
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
    <View style={styles.navigationHeader}>
      <View style={styles.progressIndicator}>
        <Text style={[styles.progressText, { color: theme.text }]}>
          Step 2 of 5: Scene Generation
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '40%', backgroundColor: theme.primary }]} />
        </View>
      </View>
      <TouchableOpacity
        style={[styles.nextButton, { backgroundColor: theme.primary }]}
        onPress={onNext}
      >
        <Text style={styles.nextButtonText}>Next: Audio Selection</Text>
        <Ionicons name="arrow-forward" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );

  const renderImageSettingsModal = () => {
    return (
      <Modal
        visible={showImageSettings}
        transparent
        animationType="slide"
        onRequestClose={() => setShowImageSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Choose Format</Text>
              <TouchableOpacity onPress={() => setShowImageSettings(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formatSelector}>
              <Text style={[styles.formatLabel, { color: theme.textSecondary }]}>Image Format:</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.formatOptions}
              >
                <TouchableOpacity
                  style={[
                    styles.formatChip, 
                    imageSettings.width === 1024 && imageSettings.height === 1024 && 
                      { backgroundColor: theme.primary }
                  ]}
                  onPress={() => setImageSettings(prev => ({
                    ...prev, width: 1024, height: 1024, aspectRatio: '1:1'
                  }))}
                >
                  <Text style={[
                    styles.formatChipText, 
                    imageSettings.width === 1024 && imageSettings.height === 1024 && { color: '#fff' }
                  ]}>Square</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.formatChip, 
                    imageSettings.width === 768 && imageSettings.height === 1152 && 
                      { backgroundColor: theme.primary }
                  ]}
                  onPress={() => setImageSettings(prev => ({
                    ...prev, width: 768, height: 1152, aspectRatio: '2:3'
                  }))}
                >
                  <Text style={[
                    styles.formatChipText, 
                    imageSettings.width === 768 && imageSettings.height === 1152 && { color: '#fff' }
                  ]}>Portrait</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.formatChip, 
                    imageSettings.width === 1152 && imageSettings.height === 768 && 
                      { backgroundColor: theme.primary }
                  ]}
                  onPress={() => setImageSettings(prev => ({
                    ...prev, width: 1152, height: 768, aspectRatio: '3:2'
                  }))}
                >
                  <Text style={[
                    styles.formatChipText, 
                    imageSettings.width === 1152 && imageSettings.height === 768 && { color: '#fff' }
                  ]}>Landscape</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.formatChip, 
                    imageSettings.width === 1792 && imageSettings.height === 1024 && 
                      { backgroundColor: theme.primary }
                  ]}
                  onPress={() => setImageSettings(prev => ({
                    ...prev, width: 1792, height: 1024, aspectRatio: '16:9'
                  }))}
                >
                  <Text style={[
                    styles.formatChipText, 
                    imageSettings.width === 1792 && imageSettings.height === 1024 && { color: '#fff' }
                  ]}>Widescreen</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.formatChip, 
                    imageSettings.width === 1024 && imageSettings.height === 1792 && 
                      { backgroundColor: theme.primary }
                  ]}
                  onPress={() => setImageSettings(prev => ({
                    ...prev, width: 1024, height: 1792, aspectRatio: '9:16'
                  }))}
                >
                  <Text style={[
                    styles.formatChipText, 
                    imageSettings.width === 1024 && imageSettings.height === 1792 && { color: '#fff' }
                  ]}>Vertical</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
            
            <View style={styles.qualitySelector}>
              <Text style={[styles.qualitySelectorLabel, { color: theme.text }]}>Quality</Text>
              <View style={styles.qualityOptions}>
                {['low', 'medium', 'high'].map(quality => (
                  <TouchableOpacity
                    key={quality}
                    style={[
                      styles.qualityPill,
                      { 
                        backgroundColor: imageSettings.resolution === quality ? 
                          theme.primary : theme.buttonBg,
                      }
                    ]}
                    onPress={() => setImageSettings(prev => ({ ...prev, resolution: quality as any }))}
                  >
                    <Text 
                      style={[
                        styles.qualityPillText, 
                        { color: imageSettings.resolution === quality ? '#fff' : theme.text }
                      ]}
                    >
                      {quality.charAt(0).toUpperCase() + quality.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.doneButton, { backgroundColor: theme.primary }]}
              onPress={() => setShowImageSettings(false)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

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
            
            <Text style={[styles.inputLabel, { color: theme.text }]}>Scene</Text>
            <TextInput
              style={[styles.textInput, { color: theme.text, borderColor: theme.border }]}
              value={scene.scene}
              onChangeText={(value) => handleSceneFieldUpdate(editingSceneIndex, 'scene', value)}
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
            
            <Text style={[styles.inputLabel, { color: theme.text }]}>Visual Details</Text>
            <TextInput
              style={[styles.textInput, { color: theme.text, borderColor: theme.border, height: 80 }]}
              value={scene.visual_details}
              onChangeText={(value) => handleSceneFieldUpdate(editingSceneIndex, 'visual_details', value)}
              multiline
            />
            
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
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Scene Generation</Text>
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: theme.primary }]}
          onPress={onNext}
        >
          <Text style={styles.nextButtonText}>Next</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.formatSelector, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.formatLabel, { color: theme.textSecondary }]}>Image Format:</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.formatOptions}
        >
          <TouchableOpacity
            style={[
              styles.formatChip, 
              imageSettings.width === 1024 && imageSettings.height === 1024 && 
                { backgroundColor: theme.primary }
            ]}
            onPress={() => setImageSettings(prev => ({
              ...prev, width: 1024, height: 1024, aspectRatio: '1:1'
            }))}
          >
            <Text style={[
              styles.formatChipText, 
              imageSettings.width === 1024 && imageSettings.height === 1024 && { color: '#fff' }
            ]}>Square</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.formatChip, 
              imageSettings.width === 768 && imageSettings.height === 1152 && 
                { backgroundColor: theme.primary }
            ]}
            onPress={() => setImageSettings(prev => ({
              ...prev, width: 768, height: 1152, aspectRatio: '2:3'
            }))}
          >
            <Text style={[
              styles.formatChipText, 
              imageSettings.width === 768 && imageSettings.height === 1152 && { color: '#fff' }
            ]}>Portrait</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.formatChip, 
              imageSettings.width === 1152 && imageSettings.height === 768 && 
                { backgroundColor: theme.primary }
            ]}
            onPress={() => setImageSettings(prev => ({
              ...prev, width: 1152, height: 768, aspectRatio: '3:2'
            }))}
          >
            <Text style={[
              styles.formatChipText, 
              imageSettings.width === 1152 && imageSettings.height === 768 && { color: '#fff' }
            ]}>Landscape</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.formatChip, 
              imageSettings.width === 1792 && imageSettings.height === 1024 && 
                { backgroundColor: theme.primary }
            ]}
            onPress={() => setImageSettings(prev => ({
              ...prev, width: 1792, height: 1024, aspectRatio: '16:9'
            }))}
          >
            <Text style={[
              styles.formatChipText, 
              imageSettings.width === 1792 && imageSettings.height === 1024 && { color: '#fff' }
            ]}>Widescreen</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.formatChip, 
              imageSettings.width === 1024 && imageSettings.height === 1792 && 
                { backgroundColor: theme.primary }
            ]}
            onPress={() => setImageSettings(prev => ({
              ...prev, width: 1024, height: 1792, aspectRatio: '9:16'
            }))}
          >
            <Text style={[
              styles.formatChipText, 
              imageSettings.width === 1024 && imageSettings.height === 1792 && { color: '#fff' }
            ]}>Vertical</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ color: theme.text }}>Generating scenes...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scenesList}>
          {localScenes.map((scene, index) => (
            <SceneCard
              key={index}
              scene={scene}
              index={index}
              isEditing={editingSceneIndex === index}
              onEdit={() => handleEditScene(index)}
              onUpdate={(updatedScene) => handleUpdateScene(index, updatedScene)}
              onGenerateImage={() => handleGenerateImage(scene, index)}
              isGeneratingImage={loadingImages[index]}
              theme={theme}
            />
          ))}
        </ScrollView>
      )}
      {renderImageSettingsModal()}
      {renderEditModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  nextButton: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 8 },
  nextButtonText: { color: '#fff', fontWeight: '600', marginRight: 8 },
  settingsToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  toolbarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolbarDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#ddd',
    marginHorizontal: 12,
  },
  aspectRatioScroll: {
    maxWidth: 180,
  },
  aspectRatioChip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: '#eee',
    marginRight: 6,
  },
  resolutionChips: {
    flexDirection: 'row',
    gap: 4,
  },
  resolutionChip: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dimensionsText: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scenesList: { flex: 1 },
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
  formatSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  formatLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  formatOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  formatChip: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  formatChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  qualitySelector: {
    marginTop: 16,
  },
  qualitySelectorLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  qualityOptions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  qualityPill: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#eee',
    alignItems: 'center',
  },
  qualityPillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  doneButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  sceneCard: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
  },
  sceneDetails: {
    flex: 1,
    padding: 16,
  },
  sceneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sceneTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailText: {
    fontSize: 12,
  },
  imageSection: {
    width: 120,
    height: 120,
    marginLeft: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  sceneImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateImageButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  generateImageText: {
    fontSize: 14,
    fontWeight: '600',
  },
  editInput: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  editButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  editActionButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editActionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  navigationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#ddd',
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 6,
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
}); 