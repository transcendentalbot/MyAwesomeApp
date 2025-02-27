import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { Scene, ScenePreferences } from '../../types/Scene';
import axios from 'axios';

interface SceneGeneratorProps {
  scenes: Scene[];
  scenePreferences: ScenePreferences;
  scriptAnalysis: any;
  content: string;
  onNext: () => void;
  onUpdateScene: (index: number, scene: Scene) => void;
  onGenerateImage: (scene: Scene, index: number) => void;
}

interface EditableScene extends Scene {
  isEditing?: boolean;
}

export function SceneGenerator({
  scenes,
  scenePreferences,
  scriptAnalysis,
  content,
  onNext,
  onUpdateScene,
  onGenerateImage
}: SceneGeneratorProps) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingImages, setLoadingImages] = useState<{ [key: number]: boolean }>({});
  const [localScenes, setLocalScenes] = useState<Scene[]>([]);
  const [editingSceneIndex, setEditingSceneIndex] = useState<number | null>(null);

  useEffect(() => {
    if (scenes && Array.isArray(scenes)) {
      setLocalScenes(scenes);
    } else if (!localScenes.length) {
      generateScenes();
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
        // Ensure we're working with an array
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
        scene,
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

  const toggleEdit = (index: number) => {
    setEditingSceneIndex(editingSceneIndex === index ? null : index);
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
              onPress={() => toggleEdit(index)}
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

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={[styles.progressBarContainer, { backgroundColor: theme.buttonBg }]}>
        <View 
          style={[
            styles.progressBar, 
            { 
              backgroundColor: theme.primary,
              width: isLoading ? '50%' : localScenes.length > 0 ? '100%' : '0%' 
            }
          ]} 
        />
      </View>

      <ScrollView style={styles.content}>
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: theme.errorBg }]}>
            <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
          </View>
        )}

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.text }]}>
              Generating scenes...
            </Text>
          </View>
        ) : (
          <>
            {localScenes.length === 0 ? (
              <TouchableOpacity
                style={[styles.generateButton, { backgroundColor: theme.primary }]}
                onPress={generateScenes}
              >
                <Text style={styles.generateButtonText}>Generate Scenes</Text>
              </TouchableOpacity>
            ) : (
              localScenes.map((scene, index) => renderSceneCard(scene, index))
            )}
          </>
        )}
      </ScrollView>

      {localScenes.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: theme.primary }]}
            onPress={onNext}
          >
            <Text style={styles.nextButtonText}>Next: Audio Selection</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  progressBarContainer: {
    height: 4,
    borderRadius: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.3s ease-in-out',
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
  },
  generateButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  sceneCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  footer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cardContent: {
    flexDirection: 'row',
    gap: 16,
  },
  sceneDetails: {
    flex: 2,
    gap: 12,
  },
  imageSection: {
    flex: 1,
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  sceneImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  generateImageText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  detailsGrid: {
    flexDirection: 'row',
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
  sceneTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    marginVertical: 4,
  },
  sceneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  editActionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editActionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
}); 