import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, Share, Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '../lib/supabase';

const COLORS = {
  bg: '#0A0E1A',
  card: '#111827',
  accent: '#7C6AF7',
  gold: '#F5A623',
  white: '#FFFFFF',
  muted: '#8892A4',
  cardBorder: '#1E2433',
};

export default function StoryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { story, selectedVoice, storyId } = route.params;
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentStoryId, setCurrentStoryId] = useState(storyId);

  // TTS state'leri
  const [isPlaying,        setIsPlaying]        = useState(false);
  const [isLoadingAudio,   setIsLoadingAudio]   = useState(false);
  const [sound,            setSound]            = useState(null);
  const [localAudioPaths,  setLocalAudioPaths]  = useState({ female: null, male: null });

  const VOICES = {
    female: 'EXAVITQu4vr4xnSDxMaL',
    male:   'pNInz6obpgDQGcFmaJgB',
  };

  const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;

  const lines = story.split('\n').filter(line => line.trim() !== '');
  const title = lines[0];
  const content = lines.slice(1).join('\n\n');

  const handleShare = async () => {
    await Share.share({ message: story });
  };

  const handleFavorite = async () => {
    const newFavorite = !isFavorite;
    setIsFavorite(newFavorite);

    if (currentStoryId) {
      await supabase
        .from('stories')
        .update({ is_favorite: newFavorite })
        .eq('id', currentStoryId);
    }
  };

  // Ses kaynağını temizle
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Oynat / Duraklat
  const handlePlayPause = async () => {
    if (isPlaying && sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
      return;
    }

    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
      return;
    }

    setIsLoadingAudio(true);
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // Önce yerel dosyaya bak
      const localPath = `${FileSystem.documentDirectory}${currentStoryId}_${selectedVoice}.mp3`;
      const fileInfo = await FileSystem.getInfoAsync(localPath);
      if (fileInfo.exists) {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: localPath },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) setIsPlaying(false);
        });
        setIsLoadingAudio(false);
        return;
      }

      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICES[selectedVoice]}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg',
          },
          body: JSON.stringify({
            text: story,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.3,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (!response.ok) throw new Error('API hatası: ' + response.status);

      const arrayBuffer = await response.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte), ''
        )
      );
      const uri = `data:audio/mpeg;base64,${base64}`;

      // Yerel dosyaya kaydet
      try {
        await FileSystem.writeAsStringAsync(localPath, base64, {
          encoding: 'base64',
        });
      } catch (e) {
        console.log('Yerel kayıt hatası:', e);
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });

    } catch (error) {
      Alert.alert('Hata', 'Ses oluşturulamadı: ' + error.message);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.cardBorder,
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 16 }}>← Geri</Text>
        </TouchableOpacity>
        <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: 'bold' }}>Masalın</Text>
        <TouchableOpacity onPress={handleShare}>
          <Text style={{ color: COLORS.accent, fontSize: 16 }}>Paylaş</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        {/* Başlık */}
        <Text style={{
          color: COLORS.white,
          fontSize: 24,
          fontWeight: 'bold',
          marginBottom: 20,
          lineHeight: 32,
        }}>{title}</Text>

        {/* Oynat/Durdur butonu */}
        <TouchableOpacity
          onPress={handlePlayPause}
          disabled={isLoadingAudio}
          style={{
            backgroundColor: '#7C6AF7',
            borderRadius: 14,
            padding: 16,
            alignItems: 'center',
            marginBottom: 24,
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
            opacity: isLoadingAudio ? 0.7 : 1,
          }}>
          <Text style={{ fontSize: 20 }}>
            {isLoadingAudio ? '⏳' : isPlaying ? '⏸' : '▶️'}
          </Text>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>
            {isLoadingAudio ? 'Ses hazırlanıyor...' : isPlaying ? 'Durdur' : 'Sesli Dinle'}
          </Text>
        </TouchableOpacity>

        {/* Masal metni */}
        <Text style={{
          color: '#D1D5DB',
          fontSize: 17,
          lineHeight: 30,
          letterSpacing: 0.3,
        }}>{content}</Text>
      </ScrollView>

      {/* Alt butonlar */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.bg,
        borderTopWidth: 1,
        borderTopColor: COLORS.cardBorder,
        padding: 16,
        paddingBottom: 32,
        flexDirection: 'row',
        gap: 12,
      }}>
        {/* Favori butonu */}
        <TouchableOpacity
          onPress={handleFavorite}
          style={{
            flex: 1,
            backgroundColor: isFavorite ? '#F5A623' : COLORS.card,
            borderWidth: 1,
            borderColor: isFavorite ? '#F5A623' : COLORS.cardBorder,
            borderRadius: 14,
            padding: 14,
            alignItems: 'center',
          }}>
          <Text style={{ color: COLORS.white, fontSize: 14, fontWeight: 'bold' }}>
            {isFavorite ? '★ Favoride' : '☆ Favoriye Ekle'}
          </Text>
        </TouchableOpacity>

        {/* Yeni masal butonu */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            flex: 1,
            backgroundColor: COLORS.accent,
            borderRadius: 14,
            padding: 14,
            alignItems: 'center',
          }}>
          <Text style={{ color: COLORS.white, fontSize: 14, fontWeight: 'bold' }}>
            ✨ Yeni Masal
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
