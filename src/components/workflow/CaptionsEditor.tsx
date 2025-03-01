import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface CaptionsEditorProps {
  onSave: (settings: CaptionSettings) => void;
  onBack: () => void;
}

export interface CaptionSettings {
  // Font Settings
  fontSize: string;
  fontResolution: string;
  fontColor: string;
  customFontColor: string;
  fontOpacity: string;
  fontScript: string;
  fallbackFont: string;

  // Styling & Alignment
  applyFontColor: string;
  alignment: string;
  teletextSpacing: string;
  xPosition: string;
  yPosition: string;

  // Background & Outline
  backgroundColor: string;
  customBackgroundColor: string;
  backgroundOpacity: string;
  outlineSize: string;
  outlineColor: string;
  customOutlineColor: string;
}

const FONT_COLORS = ['Auto', 'White', 'Black', 'Red', 'Green', 'Blue', 'Custom (Hex/RGB)'];
const FONT_SCRIPTS = [
  'Automatically determined',
  'Latin',
  'Cyrillic',
  'Arabic',
  'Chinese',
  'Japanese',
  'Korean'
];
const FALLBACK_FONTS = [
  'Best Match',
  'Monospaced Sans-Serif',
  'Monospaced Serif',
  'Proportional Sans-Serif',
  'Proportional Serif'
];
const APPLY_FONT_COLOR = ['White text only', 'Apply to all text'];
const ALIGNMENTS = ['Auto', 'Left', 'Center', 'Right'];
const TELETEXT_SPACING = ['Auto', 'Fixed spacing'];
const BACKGROUND_COLORS = ['Auto', 'Transparent', 'Black', 'White', 'Red', 'Green', 'Blue', 'Custom (Hex/RGB)'];
const OUTLINE_COLORS = ['Auto', 'White', 'Black', 'Red', 'Green', 'Blue', 'Custom (Hex/RGB)'];

export function CaptionsEditor({ onSave, onBack }: CaptionsEditorProps) {
  const { theme } = useTheme();
  const [settings, setSettings] = useState<CaptionSettings>({
    fontSize: 'Auto',
    fontResolution: 'Auto',
    fontColor: 'Auto',
    customFontColor: '',
    fontOpacity: 'Auto',
    fontScript: 'Automatically determined',
    fallbackFont: 'Best Match',
    applyFontColor: 'White text only',
    alignment: 'Auto',
    teletextSpacing: 'Auto',
    xPosition: 'Auto',
    yPosition: 'Auto',
    backgroundColor: 'Auto',
    customBackgroundColor: '',
    backgroundOpacity: 'Auto',
    outlineSize: 'Auto',
    outlineColor: 'Auto',
    customOutlineColor: ''
  });
  
  const [expandedSection, setExpandedSection] = useState('font');

  const handleChange = (field: keyof CaptionSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const renderNumericInput = (label: string, field: keyof CaptionSettings, unit: string) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <View style={styles.numericInputContainer}>
        <TextInput
          style={[styles.numericInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
          value={settings[field] as string}
          onChangeText={(value) => handleChange(field, value)}
          placeholder="Auto"
          placeholderTextColor={theme.textSecondary}
          keyboardType="numeric"
        />
        <Text style={[styles.unit, { color: theme.textSecondary }]}>{unit}</Text>
      </View>
    </View>
  );

  const renderDropdown = (label: string, field: keyof CaptionSettings, options: string[]) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <View style={[styles.selectContainer, { borderColor: theme.border, backgroundColor: theme.card }]}>
        <select
          value={settings[field]}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange(field, e.target.value)}
          style={{
            width: '100%',
            height: 40,
            padding: '8px 12px',
            border: 'none',
            borderRadius: 8,
            color: theme.text,
            backgroundColor: 'transparent',
            outline: 'none',
            fontSize: '14px'
          }}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </View>
    </View>
  );

  const renderColorPicker = (field: 'fontColor' | 'backgroundColor' | 'outlineColor', customField: keyof CaptionSettings, options: string[]) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: theme.text }]}>{field === 'fontColor' ? 'Font Color' : field === 'backgroundColor' ? 'Background Color' : 'Outline Color'}</Text>
      <View style={styles.colorPickerContainer}>
        <View style={styles.colorOptions}>
          {options.filter(option => option !== 'Custom (Hex/RGB)').map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color.toLowerCase() === 'auto' ? theme.card : color.toLowerCase() },
                settings[field] === color && styles.selectedColorOption,
                color.toLowerCase() === 'auto' && { borderWidth: 1, borderColor: theme.border }
              ]}
              onPress={() => handleChange(field, color)}
            >
              {settings[field] === color && (
                <Ionicons name="checkmark" size={16} color={color.toLowerCase() === 'white' ? '#000' : '#fff'} />
              )}
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[
              styles.customColorOption,
              { borderColor: theme.border },
              settings[field] === 'Custom (Hex/RGB)' && { borderColor: theme.primary }
            ]}
            onPress={() => handleChange(field, 'Custom (Hex/RGB)')}
          >
            <Ionicons name="color-palette" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>
        {settings[field] === 'Custom (Hex/RGB)' && (
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card, marginTop: 8 }]}
            value={settings[customField] as string}
            onChangeText={(value) => handleChange(customField, value)}
            placeholder="#RRGGBB or RGB(r,g,b)"
            placeholderTextColor={theme.textSecondary}
          />
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Caption Settings</Text>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.primary }]}
          onPress={() => onSave(settings)}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.formContent}>
        <View style={styles.threeColumnLayout}>
          <View style={[styles.column, { backgroundColor: theme.card }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="text" size={20} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Font Settings</Text>
            </View>
            <View style={styles.sectionContent}>
              {renderNumericInput('Font Size', 'fontSize', 'pt')}
              {renderNumericInput('Font Resolution', 'fontResolution', 'dpi')}
              {renderColorPicker('fontColor', 'customFontColor', FONT_COLORS)}
              {renderNumericInput('Font Opacity', 'fontOpacity', '%')}
              {renderDropdown('Font Script', 'fontScript', FONT_SCRIPTS)}
              {renderDropdown('Fallback Font', 'fallbackFont', FALLBACK_FONTS)}
            </View>
          </View>

          <View style={[styles.column, { backgroundColor: theme.card }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="options" size={20} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Styling & Alignment</Text>
            </View>
            <View style={styles.sectionContent}>
              {renderDropdown('Apply Font Color', 'applyFontColor', APPLY_FONT_COLOR)}
              {renderDropdown('Alignment', 'alignment', ALIGNMENTS)}
              {renderDropdown('Teletext Spacing', 'teletextSpacing', TELETEXT_SPACING)}
              <View style={styles.rowInputs}>
                <View style={styles.halfWidth}>
                  {renderNumericInput('X Position', 'xPosition', 'px')}
                </View>
                <View style={styles.halfWidth}>
                  {renderNumericInput('Y Position', 'yPosition', 'px')}
                </View>
              </View>
            </View>
          </View>

          <View style={[styles.column, { backgroundColor: theme.card }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="color-palette" size={20} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Background & Outline</Text>
            </View>
            <View style={styles.sectionContent}>
              {renderColorPicker('backgroundColor', 'customBackgroundColor', BACKGROUND_COLORS)}
              {renderNumericInput('Background Opacity', 'backgroundOpacity', '%')}
              {renderNumericInput('Outline Size', 'outlineSize', 'px')}
              {renderColorPicker('outlineColor', 'customOutlineColor', OUTLINE_COLORS)}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  backButton: {
    padding: 8,
  },
  formContent: {
    flex: 1,
    padding: 16,
  },
  threeColumnLayout: {
    flexDirection: 'row',
    gap: 16,
  },
  column: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 300,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionContent: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  numericInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  numericInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  unit: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  colorPickerContainer: {
    width: '100%',
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: '#000',
  },
  customColorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
  },
}); 