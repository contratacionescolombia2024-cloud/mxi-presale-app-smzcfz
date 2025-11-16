
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { Message } from '@/types';
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
import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/integrations/supabase/client';

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
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  newMessageCard: {
    ...commonStyles.card,
    padding: 20,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  sendButton: {
    ...buttonStyles.primary,
  },
  sendButtonText: {
    ...buttonStyles.primaryText,
  },
  messagesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  messageCard: {
    ...commonStyles.card,
    padding: 16,
    marginBottom: 12,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  messageDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgePending: {
    backgroundColor: `${colors.warning}20`,
  },
  statusBadgeAnswered: {
    backgroundColor: `${colors.success}20`,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextPending: {
    color: colors.warning,
  },
  statusTextAnswered: {
    color: colors.success,
  },
  messageText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
  },
  responseContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  responseLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  responseText: {
    fontSize: 14,
    color: colors.text,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
});

export default function MessagesScreen() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadMessages();
      
      // Subscribe to real-time updates
      const subscription = supabase
        .channel('messages_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            console.log('Messages changed, reloading...');
            loadMessages();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const loadMessages = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      if (data) {
        setMessages(data.map(m => ({
          id: m.id,
          userId: m.user_id,
          userName: m.user_name,
          message: m.message,
          response: m.response || undefined,
          status: m.status as 'pending' | 'answered',
          createdAt: m.created_at || '',
        })));
      }
    } catch (error) {
      console.error('Error in loadMessages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to send messages');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          user_id: user.id,
          user_name: user.name,
          message: message.trim(),
          status: 'pending',
        });

      if (error) {
        console.error('Error sending message:', error);
        throw new Error('Failed to send message');
      }

      Alert.alert('Success', 'Your message has been sent to the administrator');
      setMessage('');
      await loadMessages();
    } catch (error: any) {
      console.error('Send message error:', error);
      Alert.alert('Error', error.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Messages</Text>
          <Text style={styles.subtitle}>Contact support</Text>
        </View>

        <View style={styles.newMessageCard}>
          <Text style={styles.inputLabel}>New Message</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Type your message here..."
            placeholderTextColor={colors.textSecondary}
            value={message}
            onChangeText={setMessage}
            multiline
            editable={!loading}
          />
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={handleSend}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.sendButtonText}>Send Message</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.messagesTitle}>Your Messages</Text>

        {loadingMessages ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol 
              ios_icon_name="envelope.open.fill" 
              android_material_icon_name="mail_outline" 
              size={64} 
              color={colors.textSecondary} 
            />
            <Text style={styles.emptyStateText}>
              No messages yet.{'\n'}Send a message to get started.
            </Text>
          </View>
        ) : (
          messages.map((msg) => (
            <View key={msg.id} style={styles.messageCard}>
              <View style={styles.messageHeader}>
                <Text style={styles.messageDate}>
                  {new Date(msg.createdAt).toLocaleDateString()}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    msg.status === 'pending'
                      ? styles.statusBadgePending
                      : styles.statusBadgeAnswered,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      msg.status === 'pending'
                        ? styles.statusTextPending
                        : styles.statusTextAnswered,
                    ]}
                  >
                    {msg.status === 'pending' ? 'Pending' : 'Answered'}
                  </Text>
                </View>
              </View>

              <Text style={styles.messageText}>{msg.message}</Text>

              {msg.response && (
                <View style={styles.responseContainer}>
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
