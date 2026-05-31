import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  Dimensions, StatusBar, Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    emoji: '🌙',
    title: 'Her Gece Yeni Bir Masal',
    description: 'Çocuğunuz için tamamen kişiselleştirilmiş, yapay zeka ile yazılmış benzersiz uyku masalları.',
  },
  {
    id: '2',
    emoji: '✨',
    title: 'Sonsuz Tema Seçeneği',
    description: 'Hayvanlar, sihir, macera, uzay ve daha fazlası... Yüzlerce tema arasından seçin, masalı yapay zeka yazsın.',
  },
  {
    id: '3',
    emoji: '🎙️',
    title: 'Profesyonel Sesli Anlatım',
    description: 'Kadın veya erkek sesi seçin. Masalınız tıpkı bir masal anlatıcısı gibi duygusal ve akıcı seslendirilir.',
  },
];

export default function OnboardingScreen({ onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      onFinish();
    }
  };

  const handleSkip = () => {
    onFinish();
  };

  const renderSlide = ({ item }) => (
    <View style={{
      width,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    }}>
      <Text style={{ fontSize: 100, marginBottom: 32 }}>{item.emoji}</Text>
      <Text style={{
        color: '#FFFFFF',
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 34,
      }}>
        {item.title}
      </Text>
      <Text style={{
        color: '#8892A4',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 26,
      }}>
        {item.description}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0E1A' }} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E1A" />

      {/* Header - Skip butonu */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginTop: 8,
      }}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={{ color: '#8892A4', fontSize: 15 }}>Geç</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={{ flex: 1 }}
      />

      {/* Alt alan */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
        
        {/* Nokta göstergesi */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginBottom: 32,
          gap: 8,
        }}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={{
                width: index === currentIndex ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: index === currentIndex ? '#7C6AF7' : '#1E2433',
              }}
            />
          ))}
        </View>

        {/* Next / Başla butonu */}
        <TouchableOpacity
          onPress={handleNext}
          style={{
            backgroundColor: '#7C6AF7',
            borderRadius: 16,
            padding: 18,
            alignItems: 'center',
          }}>
          <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: 'bold' }}>
            {currentIndex === slides.length - 1 ? '🌙 Başlayalım' : 'Devam Et →'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
