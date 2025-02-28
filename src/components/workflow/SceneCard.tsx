import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Scene } from '../../types/Scene';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

interface SceneCardProps {
  scene: Scene;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onUpdate: (updatedScene: Scene) => void;
  onGenerateImage: () => void;
  isGeneratingImage: boolean;
  theme: any;
}

export const SceneCard: React.FC<SceneCardProps> = ({
  scene,
  index,
  isEditing,
  onEdit,
  onUpdate,
  onGenerateImage,
  isGeneratingImage,
  theme,
}) => {
  const handleDownloadImage = async () => {
    if (!scene.imageUrl) return;
    
    try {
      if (Platform.OS === 'web') {
        // Web-specific download method
        const link = document.createElement('a');
        link.href = scene.imageUrl;
        link.download = `scene_${index}_${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      
      // Native platforms (iOS, Android)
      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need permission to save the image to your device');
        return;
      }

      // Download image
      const fileName = `scene_${index}_${Date.now()}.jpg`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      const downloadResult = await FileSystem.downloadAsync(scene.imageUrl, fileUri);
      
      if (downloadResult.status === 200) {
        // Save to media library on mobile
        const asset = await MediaLibrary.createAssetAsync(fileUri);
        await MediaLibrary.createAlbumAsync('Scene Images', asset, false);
        Alert.alert('Success', 'Image saved to your photos');
      }
    } catch (error) {
      console.error('Error downloading image:', error);
      Alert.alert('Download Failed', 'There was an error downloading the image');
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.cardContent}>
        {/* Left side - Details */}
        <View style={styles.detailsSection}>
          <View style={styles.titleRow}>
            <Text style={[styles.sceneTitle, { color: theme.text }]}>
              Scene {index + 1}: {scene.scene}
            </Text>
            <TouchableOpacity 
              style={[styles.editButton, { backgroundColor: theme.buttonBg }]} 
              onPress={onEdit}
            >
              <Ionicons name="pencil" size={16} color={theme.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Setting</Text>
              <Text style={[styles.detailText, { color: theme.text }]} numberOfLines={1}>
                {scene.setting}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Time</Text>
              <Text style={[styles.detailText, { color: theme.text }]} numberOfLines={1}>
                {scene.time_of_day}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Right side - Image */}
        <View style={styles.imageSection}>
          {scene.imageUrl ? (
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: scene.imageUrl }} 
                style={styles.thumbnail} 
                resizeMode="cover"
              />
              <View style={styles.imageActions}>
                <TouchableOpacity 
                  style={[styles.imageActionButton, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
                  onPress={handleDownloadImage}
                >
                  <Ionicons name="download" size={16} color="white" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.imageActionButton, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
                  onPress={onGenerateImage}
                >
                  <Ionicons name="refresh" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              style={[styles.imagePlaceholder, { backgroundColor: theme.buttonBg }]}
              onPress={onGenerateImage}
              disabled={isGeneratingImage}
            >
              {isGeneratingImage ? (
                <Ionicons name="hourglass" size={24} color={theme.primary} />
              ) : (
                <Ionicons name="image" size={24} color={theme.primary} />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  detailsSection: {
    flex: 3,
    marginRight: 12,
  },
  sceneTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    width: '50%',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailText: {
    fontSize: 13,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  editButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 4,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  imageActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  imageActionButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 