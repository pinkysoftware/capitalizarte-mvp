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
  ScrollView,
} from 'react-native';
import { api } from '../services/api';

const COLORS = {
  background: '#0D0F14',
  surface: '#141820',
  surfaceSoft: '#1A1F2B',
  primary: '#D4A017',
  primaryBright: '#F0C040',
  text: '#E8E8E8',
  textMuted: '#9A9FAA',
  border: 'rgba(212, 160, 23, 0.22)',
  green: '#2ECC40',
  red: '#E53935',
  aiBg: '#1a1f2b',
};

const SUGGESTIONS = [
  '¿Cuánto gasté esta semana?',
  '¿Cuál fue mi mayor gasto?',
  '¿Cuánto llevo gastado en comida?',
  '¿Cuánto gané este mes?',
  '¿Cuál es mi balance?',
];

function SuggestionChip({ text, onPress }) {
  return (
    <Pressable style={styles.suggestionChip} onPress={onPress}>
      <Text style={styles.suggestionText}>{text}</Text>
    </Pressable>
  );
}

function Message({ role, content }) {
  const isUser = role === 'user';
  return (
    <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
      {!isUser && <Text style={styles.msgAvatar}>🤖</Text>}
      <View style={[styles.msgBubble, isUser ? styles.msgBubbleUser : styles.msgBubbleAI]}>
        <Text style={[styles.msgText, isUser ? styles.msgTextUser : styles.msgTextAI]}>{content}</Text>
      </View>
      {isUser && <Text style={styles.msgAvatar}>👤</Text>}
    </View>
  );
}

function buildPrompt(messages, context) {
  const txList = context.map(t => `${t.tipo === 'INGRESO' ? '↑' : '↓'} ${t.categoria} $${Number(t.monto).toFixed(2)} - ${t.descripcion || '(sin desc)'}`).join('\n');
  return `Sos el asistente financiero de Capitalizarte. Respondé en español, de forma clara y breve.

Resumen de transacciones:
${txList || 'No hay transacciones registradas.'}

${messages.filter(m => m.role === 'user').map(m => `Usuario: ${m.content}`).join('\n')}`;
}

export default function ChatScreen({ navigation }) {
  const [messages, setMessages] = useState([
    { role: 'ai', content: '👋 ¡Hola! Soy tu asistente financiero.\n\nPreguntame cualquier cosa sobre tus gastos e ingresos. Ejemplos:\n• "¿Cuánto gasté en comida esta semana?"\n• "¿Cuál fue mi mayor gasto del mes?"\n• "¿Cuánto llevo gastado en transporte?"' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);
  const [txData, setTxData] = useState([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const res = await api.listTx(200);
      setTxData(res.transactions || []);
    } catch { /* silent */ }
  };

  const send = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = text.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const conversation = [...messages, { role: 'user', content: userMsg }];
      const prompt = buildPrompt(conversation, txData);

      // Usamos el chatbot de la web si hay API key, si no respondemos localmente
      const res = await fetch('https://www.capitalizarte.com/api/chatbot_api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt }),
      }).catch(() => null);

      let reply = '';
      if (res?.ok) {
        const data = await res.json().catch(() => null);
        reply = data?.reply || data?.message || '';
      }

      if (!reply) {
        // Fallback inteligente local
        reply = generateLocalReply(userMsg, txData);
      }

      setMessages(prev => [...prev, { role: 'ai', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: 'Tuve un problema al procesar tu pregunta. ¿Podés intentar de nuevo?' }]);
    } finally {
      setLoading(false);
    }
  };

  function generateLocalReply(question, txs) {
    const q = question.toLowerCase();
    const now = new Date();
    const thisMonth = txs.filter(t => {
      const d = new Date(t.fecha);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const thisWeek = txs.filter(t => {
      const d = new Date(t.fecha);
      const diff = (now - d) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    });

    if (q.includes('comida') || q.includes('aliment')) {
      const total = thisMonth.filter(t => t.categoria === 'Alimentacion' && t.tipo === 'GASTO').reduce((s, t) => s + Number(t.monto), 0);
      return total > 0 ? `En alimentación llevás gastado **$${total.toFixed(2)}** este mes.` : 'No tengo registros de gastos en alimentación este mes.';
    }
    if (q.includes('transporte') || q.includes('nafta') || q.includes('uber')) {
      const total = thisMonth.filter(t => t.categoria === 'Transporte' && t.tipo === 'GASTO').reduce((s, t) => s + Number(t.monto), 0);
      return total > 0 ? `En transporte llevás gastado **$${total.toFixed(2)}** este mes.` : 'No tengo registros de gastos en transporte este mes.';
    }
    if (q.includes('semana') || q.includes('esta semana')) {
      const gastos = thisWeek.filter(t => t.tipo === 'GASTO').reduce((s, t) => s + Number(t.monto), 0);
      const ingresos = thisWeek.filter(t => t.tipo === 'INGRESO').reduce((s, t) => s + Number(t.monto), 0);
      return `Esta semana:\n• Ingresos: **$${ingresos.toFixed(2)}**\n• Gastos: **$${gastos.toFixed(2)}**\n• Balance: **$${(ingresos - gastos).toFixed(2)}**`;
    }
    if (q.includes('balance') || q.includes('neto') || q.includes('resultado')) {
      const gastos = thisMonth.filter(t => t.tipo === 'GASTO').reduce((s, t) => s + Number(t.monto), 0);
      const ingresos = thisMonth.filter(t => t.tipo === 'INGRESO').reduce((s, t) => s + Number(t.monto), 0);
      const balance = ingresos - gastos;
      return `Este mes:\n• Ingresos: **$${ingresos.toFixed(2)}**\n• Gastos: **$${gastos.toFixed(2)}**\n• Balance: **$${balance.toFixed(2)}** ${balance >= 0 ? '✅' : '⚠️'}`;
    }
    if (q.includes('mayor') || q.includes('más gast') || q.includes('gasto grande')) {
      const gastosMes = thisMonth.filter(t => t.tipo === 'GASTO');
      if (!gastosMes.length) return 'No tengo gastos registrados este mes.';
      const mayor = gastosMes.reduce((max, t) => Number(t.monto) > Number(max.monto) ? t : max, gastosMes[0]);
      return `Tu mayor gasto fue **$${Number(mayor.monto).toFixed(2)}** en ${mayor.categoria}${mayor.descripcion ? ` (${mayor.descripcion})` : ''}.`;
    }
    if (q.includes('mes') || q.includes('este mes')) {
      const gastos = thisMonth.filter(t => t.tipo === 'GASTO').reduce((s, t) => s + Number(t.monto), 0);
      const ingresos = thisMonth.filter(t => t.tipo === 'INGRESO').reduce((s, t) => s + Number(t.monto), 0);
      return `Este mes:\n• Ingresos: **$${ingresos.toFixed(2)}**\n• Gastos: **$${gastos.toFixed(2)}**`;
    }
    if (q.includes('cuánto') && (q.includes('gan') || q.includes('ingreso'))) {
      const ingresos = thisMonth.filter(t => t.tipo === 'INGRESO').reduce((s, t) => s + Number(t.monto), 0);
      return ingresos > 0 ? `Llevás **$${ingresos.toFixed(2)}** en ingresos este mes.` : 'No tengo registros de ingresos este mes.';
    }

    return 'No estoy seguro de entender. Probá preguntando:\n• "¿Cuánto gasté en comida?"\n• "¿Cuál fue mi mayor gasto?"\n• "¿Cuánto llevo esta semana?"';
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => <Message role={item.role} content={item.content} />}
        contentContainerStyle={styles.chatList}
        ListFooterComponent={
          loading ? (
            <View style={styles.typingIndicator}>
              <ActivityIndicator color={COLORS.primary} size="small" />
              <Text style={styles.typingText}>Analizando...</Text>
            </View>
          ) : null
        }
        ListHeaderComponent={
          <View style={styles.suggestions}>
            <Text style={styles.suggestionsLabel}>Sugerencias:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsRow}>
              {SUGGESTIONS.map((s, i) => (
                <SuggestionChip key={i} text={s} onPress={() => send(s)} />
              ))}
            </ScrollView>
          </View>
        }
      />
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Preguntame sobre tus finanzas..."
          placeholderTextColor={COLORS.textMuted}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => send(input)}
          returnKeyType="send"
        />
        <Pressable style={[styles.sendBtn, !input.trim() && { opacity: 0.5 }]} onPress={() => send(input)} disabled={!input.trim()}>
          <Text style={styles.sendBtnText}>→</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  chatList: { padding: 16, paddingBottom: 80, gap: 12 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowUser: { flexDirection: 'row-reverse' },
  msgAvatar: { fontSize: 18 },
  msgBubble: { maxWidth: '75%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16 },
  msgBubbleAI: { backgroundColor: COLORS.aiBg, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: COLORS.border },
  msgBubbleUser: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  msgText: { fontSize: 15, lineHeight: 21 },
  msgTextAI: { color: COLORS.text },
  msgTextUser: { color: '#111', fontWeight: '600' },
  suggestions: { marginBottom: 16, gap: 8 },
  suggestionsLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700' },
  suggestionsRow: { gap: 8, paddingRight: 8 },
  suggestionChip: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  suggestionText: { color: COLORS.primaryBright, fontSize: 13, fontWeight: '600' },
  typingIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14 },
  typingText: { color: COLORS.textMuted, fontSize: 13 },
  inputBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, backgroundColor: COLORS.surface, borderTopWidth: 1, borderColor: COLORS.border },
  textInput: { flex: 1, backgroundColor: COLORS.surfaceSoft, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, color: COLORS.text, fontSize: 15, borderWidth: 1, borderColor: COLORS.border },
  sendBtn: { backgroundColor: COLORS.primary, borderRadius: 999, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  sendBtnText: { color: '#111', fontSize: 18, fontWeight: '800' },
});
