import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

export function MovieRenderer() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.subtitle, { color: theme.text }]}>Movie Renderer</Text>
      <View style={[styles.placeholderContent, { backgroundColor: theme.card }]}>
        <Ionicons name="film" size={48} color={theme.textSecondary} />
        <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
          Movie rendering will be available after captions are set
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    padding: 24,
  },
  placeholderText: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 16,
  },
}); 