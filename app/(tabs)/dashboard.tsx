import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Project } from '../../src/types/Project';

// Mock data for testing
const mockProjects: Project[] = [
  {
    id: '1',
    title: 'First Project',
    description: 'This is my first media project',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Second Project',
    description: 'Another cool project',
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
];

export default function Dashboard() {
  const renderProject = ({ item }: { item: Project }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/(script)/${item.id}`)}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <View style={[styles.statusBadge, 
        item.status === 'active' ? styles.activeStatus : 
        item.status === 'completed' ? styles.completedStatus : 
        styles.onHoldStatus
      ]}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  const handleCreateNew = async () => {
    const newProject = {
      id: Date.now().toString(),
      title: `New Project ${mockProjects.length + 1}`,
      description: 'Click to edit project details',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('Created new project:', newProject);
    router.push(`/(script)/${newProject.id}`);
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
        <Text style={styles.headerTitle}>My Projects</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreateNew}
        >
          <Text style={styles.buttonText}>Create New</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={mockProjects}
        renderItem={renderProject}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  list: {
    gap: 16,
    padding: 8,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  activeStatus: {
    backgroundColor: '#E3F2FD',
  },
  completedStatus: {
    backgroundColor: '#E8F5E9',
  },
  onHoldStatus: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
}); 