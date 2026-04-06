import { database } from '../src/services/database';
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Package, Truck, CheckCircle, CreditCard, Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Colors } from '../src/constants/Colors';
import { Fonts } from '../src/constants/Fonts';
import { Header } from '../src/components/Header';
import { Navbar } from '../src/components/Navbar';
import { useAuth } from '../src/contexts/AuthContext';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  if (user) {
    try {
      const result = database.getAllSync(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC',
        [user.id]
      );
      setNotifications(result);
    } catch (error) {
      console.error("Erro ao ler notificações do banco:", error);
    } finally {
      setLoading(false);
    }
  }
}, [user]);

  const getIcon = (status) => {
    switch (status) {
      case 'pending_payment': 
        return <CreditCard size={24} color={Colors.accent || '#D4AF37'} />;
      case 'preparing': 
        return <Package size={24} color={Colors.primary} />;
      case 'in_transit': 
        return <Truck size={24} color={Colors.accent || '#D4AF37'} />;
      case 'delivered': 
        return <CheckCircle size={24} color="#27ae60" />;
      default: 
        return <Bell size={24} color={Colors.primary} />;
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Notificações" showBack />
      
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
          ) : notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Bell size={60} color={Colors.secondary} opacity={0.3} />
              <Text style={styles.emptyText}>Você não tem novas notificações no momento.</Text>
            </View>
          ) : (
            notifications.map((notif) => (
              <View key={notif.id} style={styles.card}>
                <View style={styles.iconContainer}>
                  {getIcon(notif.status)}
                </View>
                
                <View style={styles.textContainer}>
                  <View style={styles.headerRow}>
                    <Text style={styles.notifTitle}>{notif.title}</Text>
                    <Text style={styles.notifTime}>{notif.date}</Text>
                  </View>
                  <Text style={styles.notifDescription}>{notif.message}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 100 },
  content: { padding: 16, gap: 12 },
  emptyContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 100, 
    gap: 16 
  },
  emptyText: { 
    fontFamily: Fonts.poppins, 
    fontSize: 14, 
    color: Colors.secondary, 
    textAlign: 'center',
    paddingHorizontal: 40
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(79,44,29,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  textContainer: { flex: 1, gap: 4 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notifTitle: { 
    fontFamily: Fonts.newsreader, 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: Colors.primary 
  },
  notifTime: { 
    fontFamily: Fonts.poppins, 
    fontSize: 11, 
    color: Colors.secondary 
  },
  notifDescription: { 
    fontFamily: Fonts.poppins, 
    fontSize: 13, 
    color: '#666', 
    lineHeight: 18 
  },
});