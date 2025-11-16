
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { Message } from '@/types';

export default function MessagesScreen() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      userId: user?.id || '1',
      userName: user?.name || 'User',
      message: 'Hello, I have a question about the vesting system.',
      response: 'Hi! The vesting system provides 3% monthly returns calculated per second. Feel free to ask if you need more details!',
      status: 'answered',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const handleSend = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    setLoading(true);
    
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user?.id || '1',
      userName: user?.name || 'User',
      message: message.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setMessages([newMessage, ...messages]);
    setMessage('');
    setLoading(false);
    
    Alert.alert('Success', 'Message sent to administrator');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <IconSymbol 
            ios_icon_name="message.fill" 
            android_material_icon_name="message" 
            size={60} 
            color={colors.primary} 
          />
          <Text style={styles.title}>Messages</Text>
          <Text style={styles.subtitle}>Contact Support</Text>
        </View>

        <View style={commonStyles.card}>
          <Text style={styles.cardTitle}>Send Message</Text>
          <TextInput
            style={styles.input}
            placeholder="Type your message here..."
            placeholderTextColor={colors.textSecondary}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          
          <TouchableOpacity
            style={[buttonStyles.primary, styles.sendButton]}
            onPress={handleSend}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.card} />
            ) : (
              <>
                <IconSymbol 
                  ios_icon_name="paperplane.fill" 
                  android_material_icon_name="send" 
                  size={20} 
                  color={colors.card} 
                />
                <Text style={[buttonStyles.text, { marginLeft: 8 }]}>Send Message</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Message History</Text>
        
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol 
              ios_icon_name="tray.fill" 
              android_material_icon_name="inbox" 
              size={60} 
              color={colors.textSecondary} 
            />
            <Text style={styles.emptyText}>No messages yet</Text>
          </View>
        ) : (
          messages.map((msg) => (
            <View key={msg.id} style={commonStyles.card}>
              <View style={styles.messageHeader}>
                <View style={styles.messageInfo}>
                  <Text style={styles.messageName}>{msg.userName}</Text>
                  <Text style={styles.messageDate}>
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: msg.status === 'answered' ? colors.success : colors.warning }
                ]}>
                  <Text style={styles.statusText}>
                    {msg.status === 'answered' ? 'Answered' : 'Pending'}
                  </Text>
                </View>
              </View>

              <View style={styles.messageContent}>
                <Text style={styles.messageLabel}>Your Message:</Text>
                <Text style={styles.messageText}>{msg.message}</Text>
              </View>

              {msg.response && (
                <View style={styles.responseContent}>
                  <Text style={styles.responseLabel}>Admin Response:</Text>
                  <Text style={styles.responseText}>{msg.response}</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    minHeight: 100,
    marginBottom: 16,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  messageInfo: {
    flex: 1,
  },
  messageName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  messageDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.card,
  },
  messageContent: {
    marginBottom: 12,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  messageText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  responseContent: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  responseLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 6,
  },
  responseText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
