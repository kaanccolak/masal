import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StatusBar, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

const COLORS = {
  bg: '#0A0E1A',
  card: '#111827',
  accent: '#7C6AF7',
  gold: '#F5A623',
  white: '#FFFFFF',
  muted: '#8892A4',
  cardBorder: '#1E2433',
  danger: '#FF4444',
};

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email);

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) setProfile(data);
    } catch (error) {
      console.log('Profil yükleme hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabından çıkmak istediğine emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
          },
        },
      ]
    );
  };

  const handleResetPassword = async () => {
    Alert.alert(
      'Şifre Sıfırla',
      `${email} adresine şifre sıfırlama bağlantısı gönderilecek.`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Gönder',
          onPress: async () => {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) {
              Alert.alert('Hata', 'E-posta gönderilemedi.');
            } else {
              Alert.alert('Başarılı!', 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Hesabı Sil',
      'Hesabını silmek istediğine emin misin? Tüm masalların ve favori listelerin kalıcı olarak silinecek. Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Hesabı Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) return;
              await supabase.from('stories').delete().eq('user_id', user.id);
              await supabase.from('profiles').delete().eq('id', user.id);
              await supabase.auth.signOut();
            } catch (error) {
              Alert.alert('Hata', 'Hesap silinemedi: ' + error.message);
            }
          },
        },
      ]
    );
  };

  const Section = ({ title, children }) => (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: 'bold', marginBottom: 8, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
        {title}
      </Text>
      <View style={{ backgroundColor: COLORS.card, borderRadius: 14, borderWidth: 1, borderColor: COLORS.cardBorder, overflow: 'hidden' }}>
        {children}
      </View>
    </View>
  );

  const Row = ({ label, value, onPress, color, isLast }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: COLORS.cardBorder,
      }}>
      <Text style={{ color: color || COLORS.white, fontSize: 15 }}>{label}</Text>
      {value && <Text style={{ color: COLORS.muted, fontSize: 14 }}>{value}</Text>}
      {onPress && !value && <Text style={{ color: COLORS.muted, fontSize: 18 }}>›</Text>}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <ActivityIndicator color={COLORS.accent} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  const limit = profile?.is_premium ? 30 : 5;
  const extraStories = profile?.extra_stories || 0;
  const remainingMonthly = Math.max(0, limit - (profile?.monthly_count || 0));
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })
    : '-';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.cardBorder,
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 16 }}>← Geri</Text>
        </TouchableOpacity>
        <Text style={{ color: COLORS.white, fontSize: 18, fontWeight: 'bold', marginLeft: 16 }}>Profilim</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {/* Avatar */}
        <View style={{ alignItems: 'center', marginVertical: 24 }}>
          <View style={{
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: COLORS.accent,
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 12,
          }}>
            <Text style={{ fontSize: 36 }}>🌙</Text>
          </View>
          <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: 'bold' }}>{email}</Text>
          <View style={{
            backgroundColor: profile?.is_premium ? '#2D1B4E' : '#1E2433',
            borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginTop: 8,
            borderWidth: 1, borderColor: profile?.is_premium ? COLORS.accent : COLORS.cardBorder,
          }}>
            <Text style={{ color: profile?.is_premium ? COLORS.accent : COLORS.muted, fontSize: 12 }}>
              {profile?.is_premium ? '✨ Premium Üye' : 'Ücretsiz Plan'}
            </Text>
          </View>
        </View>

        {/* Hesap Bilgileri */}
        <Section title="Hesap Bilgileri">
          <Row label="E-Posta Adresi" value={email} isLast={false} />
          <Row label="Üyelik Tarihi" value={memberSince} isLast={false} />
          <Row label="Bu Ayki Ücretsiz Masal Hakkı" value={`${remainingMonthly} masal`} isLast={extraStories === 0} />
          {extraStories > 0 && (
            <Row 
              label="Satın Alınan Masal Hakkı" 
              value={`${extraStories} masal`} 
              isLast={true} 
            />
          )}
        </Section>

        {/* Plan */}
        {!profile?.is_premium && (
          <Section title="Üyelik">
            <Row
              label="✨ Premium'a Geç"
              onPress={() => navigation.navigate('Premium')}
              color={COLORS.accent}
              isLast={true}
            />
          </Section>
        )}

        {/* Ayarlar */}
        <Section title="Ayarlar">
          <Row
            label="Şifre Sıfırla"
            onPress={handleResetPassword}
            isLast={true}
          />
        </Section>

        {/* Hesap İşlemleri */}
        <Section title="Hesap">
          <Row
            label="Çıkış Yap"
            onPress={handleSignOut}
            color={COLORS.muted}
            isLast={false}
          />
          <Row
            label="Hesabı Sil"
            onPress={handleDeleteAccount}
            color={COLORS.danger}
            isLast={true}
          />
        </Section>

      </ScrollView>
    </SafeAreaView>
  );
}
