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

const packages = [
  {
    id: '5',
    stories: 5,
    price: '49 TL',
    perStory: '9,8 TL/masal',
    emoji: '🌙',
    popular: false,
  },
  {
    id: '10',
    stories: 10,
    price: '89 TL',
    perStory: '8,9 TL/masal',
    emoji: '⭐',
    popular: true,
  },
  {
    id: '20',
    stories: 20,
    price: '149 TL',
    perStory: '7,4 TL/masal',
    emoji: '✨',
    popular: false,
  },
];

export default function ExtraStoriesScreen() {
  const navigation = useNavigation();
  const [selectedPackage, setSelectedPackage] = useState('10');

  const handlePurchase = () => {
    Alert.alert(
      'Çok Yakında! 🌙',
      'Ekstra masal paketi satın alma özelliği çok yakında aktif olacak.',
      [{ text: 'Tamam', style: 'cancel' }]
    );
  };

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
        <Text style={{ color: COLORS.white, fontSize: 18, fontWeight: 'bold', marginLeft: 16 }}>Ekstra Masal Hakkı</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        {/* Hero */}
        <View style={{ alignItems: 'center', marginVertical: 24 }}>
          <Text style={{ fontSize: 64, marginBottom: 12 }}>📚</Text>
          <Text style={{ color: COLORS.white, fontSize: 22, fontWeight: 'bold', textAlign: 'center' }}>
            Daha Fazla Masal
          </Text>
          <Text style={{ color: COLORS.muted, fontSize: 15, textAlign: 'center', marginTop: 8 }}>
            Bu ay için ekstra masal hakkı satın al
          </Text>
        </View>

        {/* Paketler */}
        <Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: 'bold', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' }}>
          Paket Seç
        </Text>

        {packages.map((pkg) => (
          <TouchableOpacity
            key={pkg.id}
            onPress={() => setSelectedPackage(pkg.id)}
            style={{
              backgroundColor: selectedPackage === pkg.id ? '#1A1040' : COLORS.card,
              borderRadius: 14,
              padding: 16,
              borderWidth: 2,
              borderColor: selectedPackage === pkg.id ? COLORS.accent : COLORS.cardBorder,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 28 }}>{pkg.emoji}</Text>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: 'bold' }}>
                    {pkg.stories} Masal Hakkı
                  </Text>
                  {pkg.popular && (
                    <View style={{
                      backgroundColor: COLORS.gold,
                      borderRadius: 6,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                    }}>
                      <Text style={{ color: '#000', fontSize: 10, fontWeight: 'bold' }}>POPÜLER</Text>
                    </View>
                  )}
                </View>
                <Text style={{ color: COLORS.muted, fontSize: 13, marginTop: 2 }}>{pkg.perStory}</Text>
              </View>
            </View>
            <Text style={{ color: COLORS.white, fontSize: 18, fontWeight: 'bold' }}>{pkg.price}</Text>
          </TouchableOpacity>
        ))}

        {/* Satın al butonu */}
        <TouchableOpacity
          onPress={handlePurchase}
          style={{
            backgroundColor: COLORS.accent,
            borderRadius: 16,
            padding: 18,
            alignItems: 'center',
            marginTop: 8,
            marginBottom: 20,
          }}>
          <Text style={{ color: COLORS.white, fontSize: 17, fontWeight: 'bold' }}>
            📚 Paketi Satın Al
          </Text>
        </TouchableOpacity>

        {/* Ayraç */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: COLORS.cardBorder }} />
          <Text style={{ color: COLORS.muted, fontSize: 13 }}>veya</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: COLORS.cardBorder }} />
        </View>

        {/* Premium'a geç */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Premium')}
          style={{
            backgroundColor: COLORS.card,
            borderRadius: 16,
            padding: 16,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: COLORS.accent,
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
          }}>
          <Text style={{ fontSize: 20 }}>✨</Text>
          <View>
            <Text style={{ color: COLORS.accent, fontSize: 15, fontWeight: 'bold' }}>Premium'a Geç</Text>
            <Text style={{ color: COLORS.muted, fontSize: 12, textAlign: 'center' }}>Ayda 30 masal • 149 TL/ay</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
