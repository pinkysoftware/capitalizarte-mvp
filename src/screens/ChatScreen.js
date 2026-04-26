import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
  Keyboard,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { chat } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

// ============================================================================
// SUGERENCIAS
// ============================================================================
const SUGGESTIONS = [
  '¿Cuánto gasté esta semana?',
  '¿Cuál fue mi mayor gasto?',
  '¿Cuánto en comida?',
  '¿Cuál es mi balance?',
  '¿Cuánto gané este mes?',
];

// ============================================================================
// ACCESOS RÁPIDOS
// ============================================================================
const QUICK_ACCESS = [
  { icon: 'bar-chart-2', label: 'Resumen del mes', color: '#8B5CF6' },
  { icon: 'pie-chart', label: 'Gastos por categoría', color: '#FBBF24' },
  { icon: 'trending-up', label: 'Balance actual', color: '#22C55E' },
  { icon: 'file-text', label: 'Reportes', color: '#3B82F6' },
];

// ============================================================================
// MESSAGE BUBBLE
// ============================================================================
function Message({ role, content }) {
  const { colors, isDark } = useTheme();
  const isUser = role === 'user';

  if (role === 'system') {
    return (
      <View style={[styles.systemMsg, { backgroundColor: colors.surfaceHover }]}>
        <Feather name="info" size={14} color={colors.textTertiary} />
        <Text style={[styles.systemText, { color: colors.textSecondary }]}>{content}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
      {!isUser && (
        <View style={[styles.aiAvatar, { backgroundColor: colors.purple }]}>
          <Feather name="cpu" size={18} color="#FFFFFF" />
        </View>
      )}
      <View style={[
        styles.bubble,
        isUser ? [styles.bubbleUser, { backgroundColor: colors.surface }] : [styles.bubbleAI, { backgroundColor: colors.surfaceHover }]
      ]}>
        <Text style={[styles.msgText, { color: isUser ? colors.text : colors.textSecondary }]}>{content}</Text>
      </View>
      {isUser && (
        <View style={[styles.userAvatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.userAvatarText}>👤</Text>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// SUGGESTION CHIP
// ============================================================================
function SuggestionChip({ text, onPress }) {
  const { colors, isDark } = useTheme();
  return (
    <Pressable
      style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, { color: colors.text }]}>{text}</Text>
    </Pressable>
  );
}

// ============================================================================
// QUICK ACCESS BUTTON
// ============================================================================
function QuickAccessBtn({ icon, label, color, onPress }) {
  const { colors } = useTheme();
  return (
    <Pressable style={[styles.quickBtn, { backgroundColor: colors.surface }]} onPress={onPress}>
      <View style={[styles.quickBtnIcon, { backgroundColor: color + '20' }]}>
        <Feather name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.quickBtnLabel, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

// ============================================================================
// RECENT QUESTION
// ============================================================================
function RecentQuestion({ question, time, onPress }) {
  const { colors } = useTheme();
  return (
    <Pressable style={[styles.recentItem, { borderBottomColor: colors.border }]} onPress={onPress}>
      <Feather name="message-circle" size={16} color={colors.textTertiary} />
      <Text style={[styles.recentText, { color: colors.textSecondary }]} numberOfLines={1}>{question}</Text>
      <Text style={[styles.recentTime, { color: colors.textTertiary }]}>{time}</Text>
    </Pressable>
  );
}

// ============================================================================
// VOICE BUTTON COMPONENT
// ============================================================================
function VoiceButton({ isRecording, onPress }) {
  const { colors } = useTheme();
  return (
    <Pressable
      style={[styles.voiceBtn, { backgroundColor: isRecording ? colors.red : colors.surfaceHover }]}
      onPress={onPress}
    >
      <Feather name={isRecording ? 'mic-off' : 'mic'} size={20} color={isRecording ? '#FFF' : colors.textSecondary} />
    </Pressable>
  );
}

// ============================================================================
// SCREEN: ChatScreen
// ============================================================================
export default function ChatScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const flatListRef = useRef(null);
  const soundRef = useRef(null);

  // Initial AI greeting
  useEffect(() => {
    setMessages([{
      role: 'ai',
      content: '¡Hola, Toche! 👋 Soy tu asistente financiero.\n\nPuedo ayudarte con:\n• Resúmenes de gastos e ingresos\n• Análisis por categoría\n• Balance y salud financiera\n• Recomendaciones personalizadas\n\n¿Qué querés saber?'
    }]);
  }, []);

  // Auto-scroll cuando llegan nuevos mensajes
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
    }
  }, [messages]);

  // TTS para leer respuesta del AI
  const speak = (text) => {
    if (!autoSpeak) return;
    Speech.stop();
    Speech.speak(text, { language: 'es-ES', pitch: 1, rate: 0.9 });
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response = await chat(userMsg);
      setMessages(prev => [...prev, { role: 'ai', content: response }]);
      speak(response);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'system', content: 'Error de conexión. Intenta de nuevo.' }]);
    } finally {
      setLoading(false);
    }
  };

  // Voice recording con expo-av
  const toggleRecording = async () => {
    if (isRecording) {
      // Detener grabación
      setIsRecording(false);
      return;
    }

    // Solicitar permisos de micrófono
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Necesito acceso al micrófono para grabar tu voz.');
        return;
      }

      setIsRecording(true);

      // Configurar para grabación de audio (necesita expo-av para grabacion real)
      // Por ahora, simulamos con un timeout
      // En producción, usar Audio.Recording API
      setTimeout(async () => {
        setIsRecording(false);
        Alert.alert('Grabación', 'Funcionalidad de transcripción voz→texto requiere integración con API de speech-to-text. Por ahora usá el teclado para escribir.');
      }, 3000);

    } catch (e) {
      setIsRecording(false);
      console.log('Recording error:', e);
    }
  };

  // Mock recent questions
  const recentQuestions = [
    { question: '¿Cuánto gasté en supermercado esta semana?', time: 'Ayer, 19:45' },
    { question: '¿Cuál fue mi mayor gasto del mes?', time: 'Ayer, 14:22' },
    { question: '¿Cuánto ahorré este mes?', time: 'Lunes' },
  ];

  return (
    <View
      style={[styles.screen, { backgroundColor: colors.bg }]}
      onLayout={() => setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200)}
    >
      {/* ============================================================
          HEADER
          ============================================================ */}
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Asistente AI</Text>
            <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Tu asistente financiero</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {/* Toggle TTS */}
          <Pressable
            style={[styles.speakToggle, { backgroundColor: autoSpeak ? colors.purple + '20' : colors.surfaceHover }]}
            onPress={() => setAutoSpeak(!autoSpeak)}
          >
            <Feather name="volume-2" size={16} color={autoSpeak ? colors.purple : colors.textTertiary} />
          </Pressable>
          <Pressable style={styles.newChatBtn}>
            <Feather name="plus" size={18} color={colors.textSecondary} />
            <Text style={[styles.newChatText, { color: colors.textSecondary }]}>Nuevo</Text>
          </Pressable>
        </View>
      </View>

      {/* ============================================================
          SCROLLABLE CONTENT
          ============================================================ */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, i) => String(i)}
        renderItem={({ item }) => <Message role={item.role} content={item.content} />}
        contentContainerStyle={[styles.messagesList, { paddingBottom: insets.bottom + 120 }]}
        ListHeaderComponent={
          <View style={styles.welcomeSection}>
            {/* AI Greeting */}
            <View style={styles.aiGreeting}>
              <View style={[styles.robotAvatar, { backgroundColor: colors.purple }]}>
                <Feather name="cpu" size={32} color="#FFFFFF" />
              </View>
              <Text style={[styles.aiGreetingText, { color: colors.text }]}>¡Hola, Toche!</Text>
            </View>

            {/* Suggestions */}
            <View style={styles.suggestionsSection}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Sugerencias</Text>
              <View style={styles.chipsRow}>
                {SUGGESTIONS.map((s, i) => (
                  <SuggestionChip key={i} text={s} onPress={() => setInput(s)} />
                ))}
              </View>
            </View>

            {/* Capabilities */}
            <View style={[styles.capabilitiesCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.capTitle, { color: colors.text }]}>¿Qué puedo hacer?</Text>
              <Text style={[styles.capText, { color: colors.textSecondary }]}>• Resumir tus gastos e ingresos por período</Text>
              <Text style={[styles.capText, { color: colors.textSecondary }]}>• Analizar en qué categorías gastás más</Text>
              <Text style={[styles.capText, { color: colors.textSecondary }]}>• Calcular tu salud financiera</Text>
              <Text style={[styles.capText, { color: colors.textSecondary }]}>• Darte recomendaciones de ahorro</Text>
            </View>

            {/* Quick Access */}
            <View style={styles.quickAccessSection}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Accesos rápidos</Text>
              <View style={styles.quickAccessGrid}>
                {QUICK_ACCESS.map((q, i) => (
                  <QuickAccessBtn key={i} icon={q.icon} label={q.label} color={q.color} onPress={() => {}} />
                ))}
              </View>
            </View>

            {/* Recent Questions */}
            {recentQuestions.length > 0 && (
              <View style={styles.recentSection}>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Preguntas recientes</Text>
                <View style={[styles.recentCard, { backgroundColor: colors.surface }]}>
                  {recentQuestions.map((rq, i) => (
                    <RecentQuestion key={i} question={rq.question} time={rq.time} onPress={() => setInput(rq.question)} />
                  ))}
                </View>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={null}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {/* ============================================================
          INPUT BAR CON VOZ
          ============================================================ */}
      <View style={[
        styles.inputBar,
        {
          backgroundColor: colors.surface,
          paddingBottom: insets.bottom + 12,
          borderTopColor: colors.border,
        }
      ]}>
        <View style={[styles.inputContainer, { backgroundColor: colors.bg, borderColor: colors.border }]}>
          {/* Voice Button */}
          <VoiceButton isRecording={isRecording} onPress={toggleRecording} />

          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Pregúntame algo sobre tus finanzas..."
            placeholderTextColor={colors.textTertiary}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />

          <Pressable
            style={[styles.sendBtn, { backgroundColor: loading ? colors.textTertiary : colors.purple }]}
            onPress={handleSend}
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Feather name="send" size={18} color="#FFFFFF" />
            )}
          </Pressable>
        </View>

        {/* Recording indicator */}
        {isRecording && (
          <View style={[styles.recordingIndicator, { backgroundColor: colors.red + '20' }]}>
            <View style={[styles.recordingDot, { backgroundColor: colors.red }]} />
            <Text style={[styles.recordingText, { color: colors.red }]}>Grabando... habla ahora</Text>
          </View>
        )}
      </View>

      {/* ============================================================
          DISCLAIMER
          ============================================================ */}
      <View style={[styles.disclaimer, { paddingBottom: insets.bottom + 70 }]}>
        <Feather name="alert-circle" size={12} color={colors.textTertiary} />
        <Text style={[styles.disclaimerText, { color: colors.textTertiary }]}>
          La información puede no ser 100% precisa. Consultá con un profesional.
        </Text>
      </View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  screen: { flex: 1 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerSub: { fontSize: 11, marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  speakToggle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  newChatBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6 },

  // Messages
  messagesList: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowUser: { flexDirection: 'row-reverse' },
  aiAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  userAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  userAvatarText: { fontSize: 14 },
  bubble: { maxWidth: '75%', padding: 12, borderRadius: 16 },
  msgText: { fontSize: 15, lineHeight: 20 },
  systemMsg: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, borderRadius: 10, marginVertical: 4 },
  systemText: { fontSize: 12, flex: 1 },

  // Welcome Section
  welcomeSection: { gap: 16, paddingBottom: 16 },
  aiGreeting: { alignItems: 'center', gap: 12, paddingTop: 16 },
  robotAvatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  aiGreetingText: { fontSize: 24, fontWeight: '800' },

  // Suggestions
  suggestionsSection: { gap: 8 },
  sectionLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13 },

  // Capabilities
  capabilitiesCard: { borderRadius: 16, padding: 16, gap: 6 },
  capTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  capText: { fontSize: 13, lineHeight: 20 },

  // Quick Access
  quickAccessSection: { gap: 8 },
  quickAccessGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickBtn: { width: '47%', flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, gap: 10 },
  quickBtnIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  quickBtnLabel: { fontSize: 13, fontWeight: '500', flex: 1 },

  // Recent Questions
  recentSection: { gap: 8 },
  recentCard: { borderRadius: 12, overflow: 'hidden' },
  recentItem: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10, borderBottomWidth: 1 },
  recentText: { flex: 1, fontSize: 13 },
  recentTime: { fontSize: 11 },

  // Input Bar
  // Input Bar
  inputBar: { marginHorizontal: 16, marginBottom: insets.bottom + 12, paddingTop: 12, borderTopWidth: 1 },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', borderRadius: 20, borderWidth: 1, paddingLeft: 8, paddingRight: 8, paddingVertical: 6, gap: 6 },
  input: { flex: 1, fontSize: 15, maxHeight: 100, paddingVertical: 6 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  // Voice Button
  voiceBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  // Recording Indicator
  recordingIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 8, marginTop: 4, borderRadius: 12 },
  recordingDot: { width: 8, height: 8, borderRadius: 4 },
  recordingText: { fontSize: 12, fontWeight: '600' },

  // Disclaimer
  // Disclaimer
  disclaimer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 16, marginBottom: insets.bottom + 8 },
  disclaimerText: { fontSize: 10, textAlign: 'center' },
});
