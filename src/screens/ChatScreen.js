import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { C, S, R, SHADOW } from '../theme';

const SUGGESTIONS = [
  '¿Cuánto gasté esta semana?',
  '¿Cuál fue mi mayor gasto?',
  '¿Cuánto en comida?',
  '¿Cuál es mi balance?',
];

function Message({ role, content }) {
  const isUser = role === 'user';
  return (
    <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
      {!isUser && <Text style={styles.avatar}>🤖</Text>}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
        <Text style={[styles.msgText, isUser ? styles.msgTextUser : styles.msgTextAI]}>{content}</Text>
      </View>
      {isUser && <Text style={styles.avatar}>👤</Text>}
    </View>
  );
}

function SuggestionChip({ text, onPress }) {
  return (
    <Pressable style={styles.chip} onPress={onPress}>
      <Text style={styles.chipText}>{text}</Text>
    </Pressable>
  );
}

export default function ChatScreen({ navigation }) {
  const [messages, setMessages] = useState([
    { role: 'ai', content: '👋 Hola, soy tu asistente financiero.\n\nPreguntame cualquier cosa sobre tus finanzas. Por ejemplo:\n• "¿Cuánto gasté en comida?"\n• "¿Cuál fue mi mayor gasto?"' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  const send = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = text.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      // Simulated AI response (mock — replace with real API later)
      await new Promise(r => setTimeout(r, 800));
      
      let reply = `Entendí: "${userMsg}"\n\nDisculpá, estoy en modo demo. Cuando conectes la API real de chatbot, voy a responder con datos真实的.\n\nPor ahora puedo decirte que uses el input de transacciones para ir cargando tus movimientos.`;
      
      setMessages(prev => [...prev, { role: 'ai', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: 'Tuve un problema. ¿Podés intentar de nuevo?' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => <Message role={item.role} content={item.content} />}
        contentContainerStyle={styles.chatList}
        ListHeaderComponent={
          <View style={styles.suggestions}>
            <Text style={styles.suggestionsLabel}>Sugerencias</Text>
            <View style={styles.chips}>
              {SUGGESTIONS.map((s, i) => (
                <SuggestionChip key={i} text={s} onPress={() => send(s)} />
              ))}
            </View>
          </View>
        }
        ListFooterComponent={loading ? (
          <View style={styles.typingRow}>
            <ActivityIndicator color={C.primary} size="small" />
          </View>
        ) : null}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Preguntame algo..."
          placeholderTextColor={C.textTertiary}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => send(input)}
          returnKeyType="send"
        />
        <Pressable style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]} onPress={() => send(input)} disabled={!input.trim()}>
          <Text style={styles.sendBtnText}>→</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  chatList: { padding: S.md, paddingBottom: 80, gap: S.sm },
  suggestions: { marginBottom: S.md, gap: S.sm },
  suggestionsLabel: { color: C.textSecondary, fontSize: 13, fontWeight: '600' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: S.xs },
  chip: { backgroundColor: C.surface, borderRadius: R.full, paddingHorizontal: S.md, paddingVertical: S.sm, borderWidth: 1, borderColor: C.border },
  chipText: { color: C.primary, fontSize: 13, fontWeight: '600' },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: S.xs },
  msgRowUser: { flexDirection: 'row-reverse' },
  avatar: { fontSize: 16 },
  bubble: { maxWidth: '75%', paddingHorizontal: S.md, paddingVertical: S.sm, borderRadius: R.md },
  bubbleAI: { backgroundColor: C.surface },
  bubbleUser: { backgroundColor: C.primary },
  msgText: { fontSize: 15, lineHeight: 21 },
  msgTextAI: { color: C.text },
  msgTextUser: { color: '#000', fontWeight: '600' },
  typingRow: { flexDirection: 'row', paddingHorizontal: S.md },
  inputBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    padding: S.md,
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  textInput: {
    flex: 1,
    backgroundColor: C.bg,
    borderRadius: R.full,
    paddingHorizontal: S.md,
    paddingVertical: 10,
    color: C.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: C.border,
  },
  sendBtn: { backgroundColor: C.primary, borderRadius: R.full, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: '#000', fontSize: 18, fontWeight: '800' },
});
