import React, { useState, useRef } from 'react';
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
  SafeAreaView,
} from 'react-native';
import { C, S, R } from '../theme';

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
    { role: 'ai', content: '👋 Hola, soy tu asistente financiero.\n\nPreguntame sobre tus finanzas. Por ej:\n• "¿Cuánto gasté en comida?"\n• "¿Cuál fue mi mayor gasto?"' }
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
      await new Promise(r => setTimeout(r, 800));
      let reply = `Entendí: "${userMsg}"\n\nEstoy en modo demo. Conectá la API real del chatbot para respuestas personalizadas.`;
      setMessages(prev => [...prev, { role: 'ai', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: 'Tuve un problema. ¿Podés intentar de nuevo?' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
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
          showsVerticalScrollIndicator={false}
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
          <Pressable
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={() => send(input)}
            disabled={!input.trim()}
          >
            <Text style={styles.sendBtnText}>→</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1 },
  chatList: { padding: S.md, paddingBottom: S.sm, gap: S.sm },
  suggestions: { marginBottom: S.md, gap: S.sm },
  suggestionsLabel: { color: C.textSecondary, fontSize: 12, fontWeight: '600' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: S.xs },
  chip: {
    backgroundColor: C.surface,
    borderRadius: R.full,
    paddingHorizontal: S.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: C.border,
  },
  chipText: { color: C.primary, fontSize: 12, fontWeight: '600' },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: S.xs },
  msgRowUser: { flexDirection: 'row-reverse' },
  avatar: { fontSize: 14 },
  bubble: { maxWidth: '75%', paddingHorizontal: S.sm, paddingVertical: S.xs, borderRadius: R.md },
  bubbleAI: { backgroundColor: C.surface },
  bubbleUser: { backgroundColor: C.primary },
  msgText: { fontSize: 14, lineHeight: 20 },
  msgTextAI: { color: C.text },
  msgTextUser: { color: '#000', fontWeight: '600' },
  typingRow: { flexDirection: 'row', paddingHorizontal: S.md },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    padding: S.sm,
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
    fontSize: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  sendBtn: {
    backgroundColor: C.primary,
    borderRadius: R.full,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },
});
