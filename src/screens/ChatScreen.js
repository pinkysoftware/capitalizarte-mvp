import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
  Keyboard,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { C, S, R } from '../theme';
import { chat, getChatHistory, saveChatHistory, clearChatHistory } from '../services/api';

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
    { role: 'ai', content: '👋 Hola, soy tu asistente financiero de Capitalizarte.\n\nPreguntame sobre tus finanzas. Por ej:\n• "¿Cuánto gasté en comida?"\n• "¿Cuál fue mi mayor gasto?"' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const flatListRef = useRef(null);

  // Keyboard tracking
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardWillShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setIsKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Scroll to end when keyboard shows
  useEffect(() => {
    if (isKeyboardVisible) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [isKeyboardVisible]);

  // Load chat history on mount
  useEffect(() => {
    (async () => {
      const history = await getChatHistory();
      if (history.length > 0) {
        setMessages(prev => {
          const base = prev[0];
          return [base, ...history];
        });
      }
    })();
  }, []);

  const send = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = text.trim();
    setInput('');
    setLoading(true);

    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);

    try {
      const history = messages.slice(-20).map(m => ({ role: m.role, content: m.content }));
      const res = await chat(userMsg, history);
      const reply = res.reply || 'No pude obtener una respuesta. Intentá de nuevo.';
      setMessages(prev => [...prev, { role: 'ai', content: reply }]);

      const newHistory = [...history, { role: 'user', content: userMsg }, { role: 'ai', content: reply }];
      await saveChatHistory(newHistory);

      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e) {
      const errorMsg = e.message === 'timeout'
        ? '⏱️ El servidor tardó demasiado. Intentá de nuevo.'
        : '❌ Tuve un problema. ¿Podés intentar de nuevo?';
      setMessages(prev => [...prev, { role: 'ai', content: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    await clearChatHistory();
    setMessages([{ role: 'ai', content: '👋 Chat borrado. ¿En qué puedo ayudarte?' }]);
  };

  const inputBarPaddingBottom = isKeyboardVisible ? keyboardHeight + 10 : 30;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Asistente AI</Text>
        <Pressable onPress={clearChat} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>🗑️ Nuevo chat</Text>
        </Pressable>
      </View>

      {/* Messages list - flat, no KeyboardAvoidingView wrapping it */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => <Message role={item.role} content={item.content} />}
        contentContainerStyle={[styles.chatList, { paddingBottom: isKeyboardVisible ? 20 : 100 }]}
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
            <Text style={styles.typingText}>El asistente está escribiendo...</Text>
            <ActivityIndicator color={C.primary} size="small" />
          </View>
        ) : null}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => Keyboard.dismiss()}
      />

      {/* Input bar - fixed at bottom with keyboard-aware padding */}
      <View style={[styles.inputWrap, { paddingBottom: inputBarPaddingBottom }]}>
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Preguntame algo..."
            placeholderTextColor={C.textTertiary}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => send(input)}
            returnKeyType="send"
            editable={!loading}
            blurOnSubmit={false}
          />
          <Pressable
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => send(input)}
            disabled={!input.trim() || loading}
          >
            <Text style={styles.sendBtnText}>➤</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: S.md,
    paddingVertical: S.sm,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: C.text },
  clearBtn: { padding: S.xs },
  clearBtnText: { fontSize: 12, color: C.textSecondary },
  chatList: { padding: S.md, gap: S.sm },
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
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    paddingHorizontal: S.md,
    paddingVertical: S.xs,
  },
  typingText: { fontSize: 12, color: C.textSecondary },
  inputWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.bg,
    paddingHorizontal: S.sm,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    paddingVertical: S.sm,
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.border,
    borderRadius: R.full,
    paddingHorizontal: S.sm,
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