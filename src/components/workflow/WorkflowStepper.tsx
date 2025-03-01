import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface WorkflowStepperProps {
  currentStep: number;
  onStepChange: (step: number) => void;
}

export function WorkflowStepper({ currentStep, onStepChange }: WorkflowStepperProps) {
  const { theme } = useTheme();
  
  const STEPS = [
    { id: 1, title: 'Script', icon: 'document-text', color: '#4CAF50' },
    { id: 2, title: 'Scenes', icon: 'images', color: '#2196F3' },
    { id: 3, title: 'Audio', icon: 'musical-notes', color: '#9C27B0' },
    { id: 4, title: 'Captions', icon: 'text', color: '#FF9800' },
    { id: 5, title: 'Render', icon: 'film', color: '#F44336' }
  ];

  return (
    <View style={[styles.stepper, { 
      backgroundColor: theme.background,
      borderBottomColor: theme.border 
    }]}>
      {STEPS.map((step) => (
        <TouchableOpacity
          key={step.id}
          style={[
            styles.stepItem,
            currentStep === step.id && styles.stepItemActive
          ]}
          onPress={() => onStepChange(step.id)}
        >
          <View style={[styles.iconContainer, { backgroundColor: step.color }]}>
            <Ionicons 
              name={step.icon as any} 
              size={24} 
              color="white"
            />
          </View>
          <Text style={[
            styles.stepText,
            { color: theme.textSecondary },
            currentStep === step.id && { color: theme.text }
          ]}>
            {step.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepText: {
    fontSize: 12,
    textAlign: 'center',
  }
}); 