import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { ScriptAnalysis } from '../../types/Script';

interface ScriptEditorProps {
  content: string;
  setContent: (content: string) => void;
  scriptAnalysis: ScriptAnalysis | null;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  onNext: () => void;
}

export function ScriptEditor({ 
  content, 
  setContent, 
  scriptAnalysis, 
  isAnalyzing, 
  onAnalyze,
  onNext 
}: ScriptEditorProps) {
  const { theme } = useTheme();

  const renderPlotPoint = (point: any, index: number) => {
    const text = typeof point === 'object' ? point.event : point;
    return (
      <Text key={index} style={[styles.plotPoint, { color: theme.textSecondary }]}>
        • {text}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.twoColumnLayout}>
        {/* Left Column - Script Editor */}
        <View style={styles.leftColumn}>
          <View style={styles.editorSection}>
            <Text style={[styles.subtitle, { color: theme.text }]}>Enter your script</Text>
            <View style={[styles.editor, { backgroundColor: theme.card }]}>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                multiline
                value={content}
                onChangeText={setContent}
                placeholder="Enter your script here..."
                placeholderTextColor={theme.textSecondary}
              />
            </View>
            
            <TouchableOpacity 
              style={[
                styles.analyzeButton,
                { backgroundColor: theme.primary },
                !content?.trim() && styles.buttonDisabled
              ]}
              onPress={onAnalyze}
              disabled={!content?.trim() || isAnalyzing}
            >
              {isAnalyzing ? (
                <View style={styles.buttonContent}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.analyzeButtonText}>Analyzing...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons name="analytics" size={20} color="white" />
                  <Text style={styles.analyzeButtonText}>Analyze Script</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Right Column - Analysis Results */}
        <View style={styles.rightColumn}>
          {scriptAnalysis ? (
            <View style={[styles.analysisContainer, { backgroundColor: theme.card }]}>
              <Text style={[styles.analysisTitle, { color: theme.text }]}>Analysis Results</Text>
              
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Title</Text>
              <Text style={[styles.analysisText, { color: theme.textSecondary }]}>
                {scriptAnalysis.story_title}
              </Text>

              <Text style={[styles.sectionTitle, { color: theme.text }]}>Characters</Text>
              {scriptAnalysis.characters?.map((character, index) => (
                <View key={index} style={styles.characterItem}>
                  <Text style={[styles.characterName, { color: theme.text }]}>{character.name}</Text>
                  <Text style={[styles.characterDesc, { color: theme.textSecondary }]}>
                    {character.description}
                  </Text>
                </View>
              ))}

              <Text style={[styles.sectionTitle, { color: theme.text }]}>Setting</Text>
              {scriptAnalysis.setting && (
                <>
                  <Text style={[styles.analysisText, { color: theme.textSecondary }]}>
                    Location: {scriptAnalysis.setting.location}
                  </Text>
                  <Text style={[styles.analysisText, { color: theme.textSecondary }]}>
                    Time: {scriptAnalysis.setting.time}
                  </Text>
                </>
              )}

              <Text style={[styles.sectionTitle, { color: theme.text }]}>Plot Points</Text>
              {scriptAnalysis.plot?.map((point, index) => renderPlotPoint(point, index))}

              <Text style={[styles.sectionTitle, { color: theme.text }]}>Moral</Text>
              <Text style={[styles.analysisText, { color: theme.textSecondary }]}>
                {scriptAnalysis.moral}
              </Text>
            </View>
          ) : (
            <View style={[styles.placeholderContent, { backgroundColor: theme.card }]}>
              <Ionicons name="analytics-outline" size={48} color={theme.textSecondary} />
              <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
                Enter your script and click Analyze to see the results
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Navigation Footer */}
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <View style={styles.footerContent}>
          {scriptAnalysis && (
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: theme.primary }]}
              onPress={onNext}
            >
              <Text style={styles.nextButtonText}>Next: Scene Generation</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  twoColumnLayout: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
    padding: 16,
  },
  leftColumn: {
    flex: 3,
  },
  rightColumn: {
    flex: 2,
  },
  editorSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  editor: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  analyzeButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  analysisContainer: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  analysisText: {
    fontSize: 14,
    marginBottom: 8,
  },
  characterItem: {
    marginBottom: 12,
  },
  characterName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  characterDesc: {
    fontSize: 14,
  },
  plotPoint: {
    fontSize: 14,
    marginBottom: 8,
    paddingLeft: 8,
  },
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    borderRadius: 8,
  },
  placeholderText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    backgroundColor: 'transparent',
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
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
});

const SAMPLE_STORY = `...`; // Move to a constants file 