import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { voiceEngines, VoiceEngine, EngineLanguage, Voice } from '../../types/Voice';

interface AudioPreferences {
  engine: 'generative' | 'long-form' | 'neural' | 'standard';
  languageCode: string;
  voiceId: string;
  sampleRate: string;
  speechRate: number;
  ssml: boolean;
}

interface AudioSelectorProps {
  content: string;
}

interface AudioResponse {
  audio_url: string;
  duration?: number;
}

// Add this function before the AudioSelector component
const sanitizeText = (text: string): string => {
  return text
    .replace(/[\n\r]/g, ' ') // Replace newlines with spaces
    .replace(/["]/g, "'") // Replace double quotes with single quotes
    .replace(/[^\x20-\x7E]/g, '') // Remove non-printable characters
    .replace(/[!]/g, '%21') // Encode exclamation marks
    .replace(/[?]/g, '%3F') // Encode question marks
    .replace(/[&]/g, '%26') // Encode ampersands
    .replace(/[#]/g, '%23') // Encode hash
    .replace(/[+]/g, '%2B') // Encode plus
    .trim(); // Remove leading/trailing whitespace
};

const VOICE_ENGINES = [
  { id: 'generative', title: 'Generative', description: 'Best for natural, human-like speech' },
  { id: 'long-form', title: 'Long Form', description: 'Optimized for longer content' },
  { id: 'neural', title: 'Neural', description: 'Advanced AI-powered voice synthesis' },
  { id: 'standard', title: 'Standard', description: 'Basic text-to-speech conversion' }
];

export function AudioSelector({ content }: AudioSelectorProps) {
  const { theme } = useTheme();
  const [showSampleRates, setShowSampleRates] = useState(false);
  const [showEngineSelector, setShowEngineSelector] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<AudioResponse | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<AudioPreferences>({
    engine: 'generative',
    languageCode: 'en-US',
    voiceId: 'Ruth',
    sampleRate: '24000Hz',
    speechRate: 100,
    ssml: false
  });

  // Get current engine data
  const currentEngine = voiceEngines.find(e => e.id === preferences.engine);
  const availableLanguages = currentEngine?.languages || [];
  const currentLanguage = availableLanguages.find(l => l.code === preferences.languageCode);
  const availableVoices = currentLanguage?.voices || [];
  const currentVoice = availableVoices.find(v => v.id === preferences.voiceId);

  const handleSubmit = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      // Cleanup previous audio if exists
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      // Take first 1000 characters of content and sanitize it
      const truncatedContent = content.substring(0, 1000);
      const sanitizedContent = sanitizeText(truncatedContent);

      const response = await fetch('https://kepe1mma62.execute-api.us-east-1.amazonaws.com/dev/script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify({
          engine: preferences.engine,
          voice_settings: {
            language_code: preferences.languageCode,
            voice_id: preferences.voiceId,
            engine: preferences.engine,
            speech_rate: preferences.speechRate / 100
          },
          audio_settings: {
            sample_rate: parseInt(preferences.sampleRate.replace('Hz', ''))
          },
          text: sanitizedContent,
          ssml_enabled: preferences.ssml
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to generate audio');
      }

      const data = await response.json();
      
      if (!data?.audio_url) {
        throw new Error('No audio URL received from server');
      }

      // Verify the URL is valid and add CORS proxy if needed
      const audioUrl = data.audio_url;
      if (!audioUrl.startsWith('http')) {
        throw new Error('Invalid audio URL received');
      }

      setGeneratedAudio(data);

      // Create new sound object
      try {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: false },
          (status) => {
            if (status.isLoaded) {
              console.log('Audio loaded successfully');
            } else if (status.error) {
              console.error('Error loading audio:', status.error);
              setError('Error loading audio: ' + status.error);
            }
          }
        );
        setSound(newSound);
      } catch (audioError) {
        console.error('Error creating audio:', audioError);
        throw new Error('Failed to load audio player');
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while generating audio';
      setError(errorMessage);
      // Cleanup on error
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
      setGeneratedAudio(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPause = async () => {
    if (!sound || !generatedAudio?.audio_url) {
      setError('No audio available to play');
      return;
    }

    try {
      const status = await sound.getStatusAsync();
      
      if (!status.isLoaded) {
        // If sound is not loaded, try to reload it
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: generatedAudio.audio_url },
          { shouldPlay: true },
          (playbackStatus) => {
            if (playbackStatus.isLoaded && !playbackStatus.isPlaying) {
              setIsPlaying(false);
            }
          }
        );
        setSound(newSound);
        setIsPlaying(true);
        return;
      }

      if (status.isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }

      // Add listener for playback completion
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && !status.isPlaying) {
          setIsPlaying(false);
        }
      });
    } catch (err) {
      console.error('Playback error:', err);
      setError('Failed to play audio. Please try again.');
      setIsPlaying(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedAudio?.audio_url) return;

    try {
      const filename = `audio_${Date.now()}.mp5`;
      const result = await FileSystem.downloadAsync(
        generatedAudio.audio_url,
        FileSystem.documentDirectory + filename
      );

      if (result.status === 200) {
        // Open the file in the default audio player
        const { uri } = result;
        await FileSystem.getInfoAsync(uri);
        console.log('Audio downloaded successfully to:', uri);
        // You can implement platform-specific file opening here
        setError('Audio saved to device. Check your downloads folder.');
      }
    } catch (err) {
      setError('Failed to download audio');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.twoColumnLayout}>
        {/* Left Column - Script Display */}
        <View style={[styles.leftColumn, { borderRightColor: theme.border }]}>
          <View style={styles.paneHeader}>
            <Text style={[styles.paneTitle, { color: theme.textSecondary }]}>Script</Text>
          </View>
          <ScrollView style={[styles.scriptDisplay, { backgroundColor: theme.card }]}>
            <Text style={[styles.scriptText, { color: theme.text }]}>{content}</Text>
          </ScrollView>
        </View>

        {/* Right Column - Audio Settings */}
        <ScrollView style={styles.rightColumn}>
          <Text style={[styles.title, { color: theme.text }]}>Audio Settings</Text>

          {/* Engine Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Voice Engine</Text>
            <TouchableOpacity
              style={[styles.dropdown, { backgroundColor: theme.card }]}
              onPress={() => setShowEngineSelector(true)}>
              <Text style={[styles.dropdownText, { color: theme.text }]}>
                {currentEngine?.title}
              </Text>
              <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Language Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Language</Text>
            <TouchableOpacity
              style={[styles.dropdown, { backgroundColor: theme.card }]}
              onPress={() => setShowLanguageSelector(true)}>
              <Text style={[styles.dropdownText, { color: theme.text }]}>
                {currentLanguage ? `${currentLanguage.name} (${currentLanguage.region})` : 'Select Language'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Voice Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Voice</Text>
            <TouchableOpacity
              style={[styles.dropdown, { backgroundColor: theme.card }]}
              onPress={() => setShowVoiceSelector(true)}>
              <Text style={[styles.dropdownText, { color: theme.text }]}>
                {currentVoice?.name || 'Select Voice'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Sample Rate and Speech Rate in one row */}
          <View style={styles.section}>
            <View style={styles.rowHeader}>
              <View style={styles.flex1}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Sample Rate</Text>
              </View>
              <View style={styles.flex1}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Speech Rate</Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={[styles.settingsCard, styles.flex1, { backgroundColor: theme.card, marginRight: 8 }]}>
                <TouchableOpacity
                  style={[styles.settingValue, { backgroundColor: theme.buttonBg }]}
                  onPress={() => setShowSampleRates(true)}>
                  <Text style={[styles.settingText, { color: theme.text }]}>{preferences.sampleRate}</Text>
                  <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
              <View style={[styles.settingsCard, styles.flex1, { backgroundColor: theme.card, marginLeft: 8 }]}>
                <Slider
                  style={styles.slider}
                  minimumValue={20}
                  maximumValue={200}
                  value={preferences.speechRate}
                  onValueChange={(value: number) =>
                    setPreferences({ ...preferences, speechRate: Math.round(value) })
                  }
                  minimumTrackTintColor={theme.primary}
                  maximumTrackTintColor={theme.buttonBg}
                  thumbTintColor={theme.primary}
                />
                <Text style={[styles.rateText, { color: theme.text }]}>{preferences.speechRate}%</Text>
              </View>
            </View>
          </View>

          {/* Audio Player */}
          {generatedAudio && (
            <View style={[styles.audioPlayer, { backgroundColor: theme.card }]}>
              {Platform.OS === 'web' ? (
                // Web Audio Player
                <View style={styles.webAudioPlayer}>
                  <audio
                    controls
                    crossOrigin="anonymous"
                    preload="auto"
                    src={generatedAudio.audio_url}
                    style={{ width: '100%' }}
                    onError={(e) => {
                      console.error('Audio playback error:', e);
                      setError('Failed to play audio. Please try downloading instead.');
                    }}
                  >
                    Your browser does not support the audio element.
                  </audio>
                  <TouchableOpacity
                    style={[styles.downloadButton, { backgroundColor: theme.buttonBg, marginTop: 8 }]}
                    onPress={() => window.open(generatedAudio.audio_url, '_blank')}>
                    <View style={styles.downloadButtonContent}>
                      <Ionicons name="download" size={20} color={theme.primary} />
                      <Text style={[styles.downloadButtonText, { color: theme.text }]}>Download</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ) : (
                // Native Audio Controls
                <View style={styles.audioControls}>
                  <TouchableOpacity
                    style={[styles.playButton, { backgroundColor: theme.primary }]}
                    onPress={handlePlayPause}>
                    <Ionicons
                      name={isPlaying ? 'pause' : 'play'}
                      size={24}
                      color="white"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.downloadButton, { backgroundColor: theme.buttonBg }]}
                    onPress={handleDownload}>
                    <Ionicons name="download" size={24} color={theme.primary} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Generate Audio Button */}
          <TouchableOpacity
            style={[
              styles.generateButton,
              { backgroundColor: theme.primary },
              isGenerating && styles.buttonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isGenerating}>
            {isGenerating ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.generateButtonText}>Generate Audio</Text>
                <Ionicons name="musical-notes" size={20} color="white" />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Language Selector Modal */}
      <Modal
        visible={showLanguageSelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageSelector(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Select Language</Text>
              <TouchableOpacity onPress={() => setShowLanguageSelector(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {availableLanguages.map(lang => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.modalOption,
                    preferences.languageCode === lang.code && { backgroundColor: theme.buttonBg }
                  ]}
                  onPress={() => {
                    setPreferences(prev => ({
                      ...prev,
                      languageCode: lang.code,
                      voiceId: lang.voices[0]?.id || ''
                    }));
                    setShowLanguageSelector(false);
                  }}>
                  <Text style={[styles.modalOptionText, { color: theme.text }]}>
                    {lang.name} ({lang.region})
                  </Text>
                  {preferences.languageCode === lang.code && (
                    <Ionicons name="checkmark" size={24} color={theme.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Voice Selector Modal */}
      <Modal
        visible={showVoiceSelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowVoiceSelector(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Select Voice</Text>
              <TouchableOpacity onPress={() => setShowVoiceSelector(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {availableVoices.map(voice => (
                <TouchableOpacity
                  key={voice.id}
                  style={[
                    styles.modalOption,
                    preferences.voiceId === voice.id && { backgroundColor: theme.buttonBg }
                  ]}
                  onPress={() => {
                    setPreferences(prev => ({ ...prev, voiceId: voice.id }));
                    setShowVoiceSelector(false);
                  }}>
                  <View style={styles.voiceOption}>
                    <Ionicons
                      name={voice.gender === 'male' ? 'man' : 'woman'}
                      size={24}
                      color={theme.textSecondary}
                    />
                    <Text style={[styles.modalOptionText, { color: theme.text }]}>
                      {voice.name}
                    </Text>
                    {voice.isBilingual && (
                      <View style={styles.bilingualBadge}>
                        <Text style={styles.bilingualText}>Bilingual</Text>
                      </View>
                    )}
                  </View>
                  {preferences.voiceId === voice.id && (
                    <Ionicons name="checkmark" size={24} color={theme.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Engine Selector Modal */}
      <Modal
        visible={showEngineSelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEngineSelector(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Select Engine</Text>
              <TouchableOpacity onPress={() => setShowEngineSelector(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {VOICE_ENGINES.map(engine => (
                <TouchableOpacity
                  key={engine.id}
                  style={[
                    styles.engineOption,
                    preferences.engine === engine.id && { backgroundColor: theme.buttonBg }
                  ]}
                  onPress={() => {
                    setPreferences(prev => ({
                      ...prev,
                      engine: engine.id as AudioPreferences['engine']
                    }));
                    setShowEngineSelector(false);
                  }}>
                  <View style={styles.engineInfo}>
                    <Text style={[styles.engineTitle, { color: theme.text }]}>{engine.title}</Text>
                    <Text style={[styles.engineDesc, { color: theme.textSecondary }]}>{engine.description}</Text>
                  </View>
                  {preferences.engine === engine.id && (
                    <Ionicons name="checkmark" size={24} color={theme.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  twoColumnLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  leftColumn: {
    flex: 1,
    borderRightWidth: 1,
    padding: 16,
  },
  rightColumn: {
    flex: 1,
    padding: 16,
  },
  paneHeader: {
    paddingVertical: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
  },
  paneTitle: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scriptDisplay: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
  },
  scriptText: {
    fontSize: 14,
    lineHeight: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
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
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  languageName: {
    fontSize: 14,
  },
  voiceCard: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
    width: 90,
  },
  voiceName: {
    fontSize: 14,
    marginTop: 8,
  },
  settingsCard: {
    borderRadius: 8,
    padding: 12,
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
  slider: {
    width: '100%',
    height: 40,
  },
  rateText: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 8,
  },
  previewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  previewText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  submitText: {
    color: 'white',
    fontSize: 16,
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
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  engineInfo: {
    flex: 1,
    marginRight: 16,
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
    opacity: 0.8,
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
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  rowHeader: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  flex1: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
  },
  modalOptionText: {
    fontSize: 16,
  },
  voiceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  audioPlayer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  webAudioPlayer: {
    width: '100%',
    padding: 8,
  },
  downloadButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 