import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

export function CaptionEditor() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.subtitle, { color: theme.text }]}>Caption Editor</Text>
      <View style={[styles.placeholderContent, { backgroundColor: theme.card }]}>
        <Ionicons name="text" size={48} color={theme.textSecondary} />
        <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
          Caption editor will be available after audio is selected
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