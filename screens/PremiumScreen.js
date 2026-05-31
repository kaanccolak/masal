import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StatusBar, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const COLORS = {
  bg: '#0A0E1A',
  card: '#111827',
  accent: '#7C6AF7',
  gold: '#F5A623',
  white: '#FFFFFF',
  muted: '#8892A4',
  cardBorder: '#1E2433',
};

export default function PremiumScreen() {
  const navigation = useNavigation();
  const [selectedPlan, setSelectedPlan] = useState('yearly');

  const handleSubscribe = () => {
    Alert.alert(
      'Çok Yakında! 🌙',
      'Premium üyelik sistemi çok yakında aktif olacak. Şu an ücretsiz planla devam edebilirsin.',
      [{ text: 'Tamam', style: 'cancel' }]
    );
  };

  const features = [
    { emoji: '📚', text: 'Ayda 30 kişiselleştirilmiş masal' },
    { emoji: '🎙️', text: 'Profesyonel sesli anlatım' },
    { emoji: '📏', text: 'Kısa, orta ve uzun masal seçeneği' },
    { emoji: '⭐', text: 'Sınırsız favori masal' },
    { emoji: '👤', text: 'Çocuk ve ebeveyn isim kişiselleştirme' },
    { emoji: '🔒', text: 'Reklamsız deneyim' },
  ];

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
        <Text style={{ color: COLORS.white, fontSize: 18, fontWeight: 'bold', marginLeft: 16 }}>Premium</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        {/* Hero */}
        <View style={{ alignItems: 'center', marginVertical: 24 }}>
          <Text style={{ fontSize: 64, marginBottom: 12 }}>✨</Text>
          <Text style={{ color: COLORS.white, fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>
            Benim Masalım Premium
          </Text>
          <Text style={{ color: COLORS.muted, fontSize: 15, textAlign: 'center', marginTop: 8 }}>
            Çocuğunuza her gece kişiselleştirilmiş masal keyfi
          </Text>
        </View>

        {/* Özellikler */}
        <View style={{
          backgroundColor: COLORS.card,
          borderRadius: 16,
          padding: 20,
          borderWidth: 1,
          borderColor: COLORS.cardBorder,
          marginBottom: 24,
        }}>
          {features.map((feature, index) => (
            <View key={index} style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: index === features.length - 1 ? 0 : 14,
              gap: 12,
            }}>
              <Text style={{ fontSize: 22 }}>{feature.emoji}</Text>
              <Text style={{ color: COLORS.white, fontSize: 15, flex: 1 }}>{feature.text}</Text>
              <Text style={{ color: '#4CAF50', fontSize: 18 }}>✓</Text>
            </View>
          ))}
        </View>

        {/* Plan seçimi */}
        <Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: 'bold', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' }}>
          Plan Seç
        </Text>

        {/* Yıllık plan */}
        <TouchableOpacity
          onPress={() => setSelectedPlan('yearly')}
          style={{
            backgroundColor: selectedPlan === 'yearly' ? '#1A1040' : COLORS.card,
            borderRadius: 14,
            padding: 16,
            borderWidth: 2,
            borderColor: selectedPlan === 'yearly' ? COLORS.accent : COLORS.cardBorder,
            marginBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: 'bold' }}>Yıllık Plan</Text>
              <View style={{
                backgroundColor: COLORS.gold,
                borderRadius: 6,
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}>
                <Text style={{ color: '#000', fontSize: 11, fontWeight: 'bold' }}>%44 İNDİRİM</Text>
              </View>
            </View>
            <Text style={{ color: COLORS.muted, fontSize: 13 }}>Tek seferlik yıllık ödeme, 12 ay kesintisiz kullanım</Text>
          </View>
          <View style={{ alignItems: 'flex-end', flexShrink: 1 }}>
            <Text style={{ color: COLORS.white, fontSize: 18, fontWeight: 'bold', textAlign: 'right' }}>1.099 TL</Text>
            <Text style={{ color: COLORS.muted, fontSize: 12 }}>/ yıl</Text>
          </View>
        </TouchableOpacity>

        {/* Aylık plan */}
        <TouchableOpacity
          onPress={() => setSelectedPlan('monthly')}
          style={{
            backgroundColor: selectedPlan === 'monthly' ? '#1A1040' : COLORS.card,
            borderRadius: 14,
            padding: 16,
            borderWidth: 2,
            borderColor: selectedPlan === 'monthly' ? COLORS.accent : COLORS.cardBorder,
            marginBottom: 24,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View>
            <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>Aylık Plan</Text>
            <Text style={{ color: COLORS.muted, fontSize: 13 }}>Her ay yenilenir</Text>
          </View>
          <View style={{ alignItems: 'flex-end', flexShrink: 1 }}>
            <Text style={{ color: COLORS.white, fontSize: 18, fontWeight: 'bold', textAlign: 'right' }}>149 TL</Text>
            <Text style={{ color: COLORS.muted, fontSize: 12 }}>/ ay</Text>
          </View>
        </TouchableOpacity>

        {/* Satın al butonu */}
        <TouchableOpacity
          onPress={handleSubscribe}
          style={{
            backgroundColor: COLORS.accent,
            borderRadius: 16,
            padding: 18,
            alignItems: 'center',
            marginBottom: 16,
          }}>
          <Text style={{ color: COLORS.white, fontSize: 17, fontWeight: 'bold' }}>
            {selectedPlan === 'yearly' ? '✨ Yıllık Planı Başlat' : '✨ Aylık Planı Başlat'}
          </Text>
        </TouchableOpacity>

        {/* Alt bilgi */}
        <Text style={{ color: COLORS.muted, fontSize: 12, textAlign: 'center', lineHeight: 18 }}>
          İstediğin zaman aboneliğini iptal edebilirsin.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}
