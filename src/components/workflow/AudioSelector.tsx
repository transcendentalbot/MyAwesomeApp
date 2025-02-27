import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import Slider from '@react-native-community/slider';
import { voiceEngines, VoiceEngine, EngineLanguage, Voice } from '../../types/Voice';

interface AudioPreferences {
  engine: 'generative' | 'long-form' | 'neural' | 'standard';
  languageCode: string;
  voiceId: string;
  sampleRate: string;
  speechRate: number;
  ssml: boolean;
  text: string;
}

export function AudioSelector() {
  const { theme } = useTheme();
  const [showSampleRates, setShowSampleRates] = useState(false);
  const [showEngineSelector, setShowEngineSelector] = useState(false);
  const [preferences, setPreferences] = useState<AudioPreferences>({
    engine: 'generative',
    languageCode: 'en-US',
    voiceId: 'Ruth',
    sampleRate: '24000Hz',
    speechRate: 100,
    ssml: false,
    text: ''
  });

  // Get current engine data
  const currentEngine = voiceEngines.find(e => e.id === preferences.engine);
  
  // Get available languages for current engine
  const availableLanguages = currentEngine?.languages || [];
  
  // Get available voices for current language
  const availableVoices = availableLanguages
    .find(l => l.code === preferences.languageCode)?.voices || [];

  const engines = [
    {
      id: 'generative',
      title: 'Generative',
      description: 'Produces the most expressive and adaptive speech using Generative AI.',
      icon: 'sparkles'
    },
    {
      id: 'long-form',
      title: 'Long-Form',
      description: 'Produces the most natural sounding speech for longer content.',
      icon: 'book'
    },
    {
      id: 'neural',
      title: 'Neural',
      description: 'Produces more natural and human-like speech than Standard Engine.',
      icon: 'brain'
    },
    {
      id: 'standard',
      title: 'Standard',
      description: 'Produces natural-sounding speech.',
      icon: 'mic'
    }
  ];

  // Sample rates from the screenshot
  const sampleRates = ['8000Hz', '16000Hz', '22050Hz', '24000Hz'];

  // Languages extracted from RSS
  const languages = [
    'English (US)',
    'English (Indian)',
    'Hindi',
    'Spanish (Spain)',
    'Spanish (Mexico)',
    'French',
    'Korean',
    'Portuguese (Brazil)',
    'Italian',
    'Turkish',
    'Czech',
    'German (Swiss)',
    'Gulf Arabic',
    'Belgian French'
  ];

  const handleSubmit = () => {
    const requestBody = {
      engine: preferences.engine,
      voice_settings: {
        language_code: 'en-US',
        voice_id: preferences.voiceId,
        engine: preferences.engine,
        speech_rate: preferences.speechRate / 100
      },
      audio_settings: {
        sample_rate: preferences.sampleRate.replace('Hz', '')
      },
      text: preferences.text,
      ssml_enabled: preferences.ssml
    };
    
    console.log('Request body:', requestBody);
  };

  const handleEngineSelect = (engineId: AudioPreferences['engine']) => {
    setPreferences(prev => ({
      ...prev,
      engine: engineId,
      // Reset language and voice when engine changes
      languageCode: voiceEngines.find(e => e.id === engineId)?.languages[0]?.code || 'en-US',
      voiceId: voiceEngines.find(e => e.id === engineId)?.languages[0]?.voices[0]?.id || ''
    }));
    setShowEngineSelector(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>Audio Settings</Text>

      {/* Engine Selection with Modal */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Voice Engine</Text>
        <TouchableOpacity
          style={[styles.dropdown, { backgroundColor: theme.card }]}
          onPress={() => setShowEngineSelector(true)}
        >
          <Text style={[styles.dropdownText, { color: theme.text }]}>
            {currentEngine?.title}
          </Text>
          <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Engine Selection Modal */}
      <Modal
        visible={showEngineSelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEngineSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Select Engine</Text>
            {voiceEngines.map(engine => (
              <TouchableOpacity
                key={engine.id}
                style={[
                  styles.engineOption,
                  preferences.engine === engine.id && { backgroundColor: theme.buttonBg }
                ]}
                onPress={() => handleEngineSelect(engine.id)}
              >
                <View>
                  <Text style={[styles.engineTitle, { color: theme.text }]}>
                    {engine.title}
                  </Text>
                  <Text style={[styles.engineDesc, { color: theme.textSecondary }]}>
                    {engine.description}
                  </Text>
                </View>
                {preferences.engine === engine.id && (
                  <Ionicons name="checkmark" size={24} color={theme.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Language Selection */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Language</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {availableLanguages.map(lang => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageCard,
                { backgroundColor: theme.card },
                preferences.languageCode === lang.code && { borderColor: theme.primary, borderWidth: 2 }
              ]}
              onPress={() => setPreferences({ ...preferences, languageCode: lang.code })}
            >
              <Text style={[styles.languageName, { color: theme.text }]}>
                {lang.name} ({lang.region})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Voice Selection */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Voice</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {availableVoices.map(voice => (
            <TouchableOpacity
              key={voice.id}
              style={[
                styles.voiceCard,
                { backgroundColor: theme.card },
                preferences.voiceId === voice.id && { borderColor: theme.primary, borderWidth: 2 }
              ]}
              onPress={() => setPreferences({ ...preferences, voiceId: voice.id })}
            >
              <Ionicons 
                name={voice.gender === 'male' ? 'man' : 'woman'} 
                size={24} 
                color={theme.textSecondary} 
              />
              <Text style={[styles.voiceName, { color: theme.text }]}>{voice.name}</Text>
              {voice.isBilingual && (
                <View style={styles.bilingualBadge}>
                  <Text style={styles.bilingualText}>Bilingual</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sample Rate Selection */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Sample Rate</Text>
        <View style={[styles.settingsCard, { backgroundColor: theme.card }]}>
          <TouchableOpacity
            style={[styles.settingValue, { backgroundColor: theme.buttonBg }]}
            onPress={() => setShowSampleRates(true)}
          >
            <Text style={[styles.settingText, { color: theme.text }]}>{preferences.sampleRate}</Text>
            <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Speech Rate Control */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Speech Rate</Text>
        <View style={[styles.settingsCard, { backgroundColor: theme.card }]}>
          <Slider
            style={styles.slider}
            minimumValue={20}
            maximumValue={200}
            value={preferences.speechRate}
            onValueChange={(value: number) => setPreferences({ ...preferences, speechRate: Math.round(value) })}
            minimumTrackTintColor={theme.primary}
            maximumTrackTintColor={theme.buttonBg}
            thumbTintColor={theme.primary}
          />
          <Text style={[styles.rateText, { color: theme.text }]}>{preferences.speechRate}%</Text>
        </View>
      </View>

      {/* Script Input */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Script</Text>
        <View style={[styles.scriptCard, { backgroundColor: theme.card }]}>
          <TextInput
            style={[styles.scriptInput, { color: theme.text, backgroundColor: theme.buttonBg }]}
            multiline
            numberOfLines={4}
            value={preferences.text}
            onChangeText={(text) => setPreferences({ ...preferences, text })}
            placeholder="Enter your script here..."
            placeholderTextColor={theme.textSecondary}
          />
          <TouchableOpacity
            style={[styles.previewButton, { backgroundColor: theme.primary }]}
            onPress={() => {/* TODO: Implement preview */}}
          >
            <Ionicons name="play" size={20} color="white" />
            <Text style={styles.previewText}>Preview</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: theme.primary }]}
        onPress={handleSubmit}
      >
        <Text style={styles.submitText}>Generate Audio</Text>
        <Ionicons name="musical-notes" size={20} color="white" />
      </TouchableOpacity>

      {/* Sample Rate Modal */}
      <Modal
        visible={showSampleRates}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSampleRates(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            {sampleRates.map(rate => (
              <TouchableOpacity
                key={rate}
                style={[
                  styles.rateOption,
                  preferences.sampleRate === rate && { backgroundColor: theme.buttonBg }
                ]}
                onPress={() => {
                  setPreferences({ ...preferences, sampleRate: rate });
                  setShowSampleRates(false);
                }}
              >
                <Text style={[styles.rateOptionText, { color: theme.text }]}>{rate}</Text>
                {preferences.sampleRate === rate && (
                  <Ionicons name="checkmark" size={20} color={theme.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  dropdownText: {
    fontSize: 14,
  },
  languageCard: {
    padding: 12,
    borderRadius: 12,
    marginRight: 8,
  },
  languageName: {
    fontSize: 14,
  },
  voiceCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 12,
    width: 100,
  },
  voiceName: {
    fontSize: 14,
    marginTop: 8,
  },
  settingsCard: {
    borderRadius: 12,
    padding: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 14,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 8,
  },
  settingText: {
    fontSize: 14,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  rateText: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 8,
  },
  scriptCard: {
    padding: 16,
    borderRadius: 12,
  },
  scriptInput: {
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  previewText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  bilingualBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  bilingualText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  rateOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
  },
  rateOptionText: {
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  engineOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  engineTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  engineDesc: {
    fontSize: 14,
  },
}); 