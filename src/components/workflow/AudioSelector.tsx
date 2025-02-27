import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

export function AudioSelector() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Audio Selection</Text>
      <View style={[styles.placeholderContent, { backgroundColor: theme.card }]}>
        <Ionicons name="musical-notes" size={48} color={theme.textSecondary} />
        <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
          Voice selection will be available after scenes are set
        </Text>
      </View>
    </View>
  );
} 