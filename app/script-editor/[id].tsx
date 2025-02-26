import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import axios from 'axios';

interface Script {
  id: string;
  projectId: string;
  content: string;
  updatedAt: string;
}

export default function ScriptEditor() {
  const { id } = useLocalSearchParams();
  const [script, setScript] = useState<Script | null>(null);
  const [content, setContent] = useState('');
  const [isSaving, setSaving] = useState(false);

  useEffect(() => {
    fetchScript();
  }, [id]);

  const fetchScript = async () => {
    try {
      // For now, using mock data
      const mockScript = {
        id: '1',
        projectId: id as string,
        content: 'This is a sample script content.\n\nYou can edit this text.',
        updatedAt: new Date().toISOString(),
      };
      setScript(mockScript);
      setContent(mockScript.content);
      
      // TODO: Implement actual API call
      // const response = await axios.get(`/api/get-script/${id}`);
      // setScript(response.data);
      // setContent(response.data.content);
    } catch (error) {
      console.error('Error fetching script:', error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // TODO: Implement actual API call
      // await axios.put(`/api/update-script/${id}`, { content });
      console.log('Script saved:', content);
    } catch (error) {
      console.error('Error saving script:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Script Editor</Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.editorContainer}>
        <TextInput
          style={styles.editor}
          multiline
          value={content}
          onChangeText={setContent}
          placeholder="Start writing your script..."
          textAlignVertical="top"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 6,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  editorContainer: {
    flex: 1,
    padding: 16,
  },
  editor: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 500,
  },
}); 