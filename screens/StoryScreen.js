import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StatusBar, Share, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const { story, storyId, themes, age_group } = route.params;
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentStoryId, setCurrentStoryId] = useState(storyId);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [sound, setSound] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState(route.params.selectedVoice || 'female');
  const [fontSize, setFontSize] = useState(16);

  const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  const VOICES = {
    female: 'Kore',
    male: 'Fenrir',
  };

  const storyParts = story.trim().split(/\n+/);
  const title = storyParts[0] || '';
  const content = storyParts.slice(1).filter(p => p.trim() !== '').join('\n\n');

  const handleShare = async () => {
    await Share.share({ message: story });
  };

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

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

      const fullText = route.params.storyRaw || story;
      const storyLines = fullText.trim().split(/\n+/);
      const storyText = storyLines.slice(1).join('\n\n');
      const localPath = `${FileSystem.documentDirectory}${currentStoryId}_${selectedVoice}.wav`;
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

      const voiceConfig = selectedVoice === 'female'
        ? { voiceName: 'Sulafat' }
        : { voiceName: 'Enceladus' };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: storyText }] }],
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: voiceConfig
                }
              }
            }
          }),
        }
      );

      const data = await response.json();

      if (!data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
        throw new Error('Ses verisi gelmedi: ' + JSON.stringify(data).substring(0, 100));
      }

      const base64Audio = data.candidates[0].content.parts[0].inlineData.data;

      const binaryStr = atob(base64Audio);
      const pcmBytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        pcmBytes[i] = binaryStr.charCodeAt(i);
      }

      const sampleRate = 24000;
      const numChannels = 1;
      const bitsPerSample = 16;
      const dataSize = pcmBytes.length;
      const wavBuffer = new ArrayBuffer(44 + dataSize);
      const view = new DataView(wavBuffer);
      const ws = (o, s) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };

      ws(0, 'RIFF');
      view.setUint32(4, 36 + dataSize, true);
      ws(8, 'WAVE');
      ws(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, numChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
      view.setUint16(32, numChannels * (bitsPerSample / 8), true);
      view.setUint16(34, bitsPerSample, true);
      ws(36, 'data');
      view.setUint32(40, dataSize, true);

      const wavBytes = new Uint8Array(wavBuffer);
      wavBytes.set(pcmBytes, 44);

      let wavBase64 = '';
      const chunkSize = 4096;
      for (let i = 0; i < wavBytes.length; i += chunkSize) {
        const chunk = wavBytes.subarray(i, Math.min(i + chunkSize, wavBytes.length));
        wavBase64 += String.fromCharCode(...chunk);
      }
      wavBase64 = btoa(wavBase64);

      await FileSystem.writeAsStringAsync(localPath, wavBase64, {
        encoding: 'base64',
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: localPath },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) setIsPlaying(false);
      });

    } catch (error) {
      Alert.alert('Hata', 'Ses oluşturulamadı: ' + error.message);
    } finally {
      setIsLoadingAudio(false);
    }
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


  console.log('STORY:', JSON.stringify(story?.substring(0, 300)));

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

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Başlık */}
        <Text style={{
          color: '#FFFFFF',
          fontSize: 22,
          fontWeight: 'bold',
          marginBottom: 12,
          lineHeight: 30,
        }}>
          {title}
        </Text>

        {(age_group || (themes && themes.length > 0)) && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {age_group && (
              <View style={{ backgroundColor: '#1E2433', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ color: '#8892A4', fontSize: 12 }}>{age_group} Yaş</Text>
              </View>
            )}
            {themes?.map((theme, i) => {
              const cleanTheme = theme.includes(':') ? theme.split(':')[1] : theme;
              return (
                <View key={i} style={{ backgroundColor: '#1E2433', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Text style={{ color: '#8892A4', fontSize: 12 }}>{cleanTheme}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Oynat/Durdur butonu */}
        <TouchableOpacity
          onPress={handlePlayPause}
          disabled={isLoadingAudio}
          style={{
            backgroundColor: '#7C6AF7', borderRadius: 14, padding: 16,
            alignItems: 'center', marginBottom: 24, flexDirection: 'row',
            justifyContent: 'center', gap: 8, opacity: isLoadingAudio ? 0.7 : 1,
          }}>
          <Text style={{ fontSize: 20 }}>
            {isLoadingAudio ? '⏳' : isPlaying ? '⏸' : '▶️'}
          </Text>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>
            {isLoadingAudio ? 'Ses hazırlanıyor...' : isPlaying ? 'Durdur' : 'Sesli Dinle'}
          </Text>
        </TouchableOpacity>

        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#111827',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#1E2433',
          padding: 4,
          marginBottom: 16,
        }}>
          <TouchableOpacity
            onPress={() => setFontSize(prev => Math.max(12, prev - 2))}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 8,
              borderRadius: 8,
            }}>
            <Text style={{ color: '#8892A4', fontSize: 15, fontWeight: 'bold' }}>A-</Text>
          </TouchableOpacity>

          <View style={{ flex: 2, alignItems: 'center' }}>
            <Text style={{ color: '#8892A4', fontSize: 12 }}>Yazı Boyutu</Text>
          </View>

          <TouchableOpacity
            onPress={() => setFontSize(prev => Math.min(24, prev + 2))}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 8,
              borderRadius: 8,
            }}>
            <Text style={{ color: '#8892A4', fontSize: 19, fontWeight: 'bold' }}>A+</Text>
          </TouchableOpacity>
        </View>

        {/* Ayraç */}
        <View style={{ height: 1, backgroundColor: '#1E2433', marginBottom: 16 }} />

        {/* İçerik - her paragraf ayrı render */}
        {content.split('\n\n').map((paragraph, index) => (
          <Text key={index} style={{
            color: '#D1D5DB',
            fontSize: fontSize,
            lineHeight: 28,
            letterSpacing: 0.2,
            marginBottom: 12,
          }}>
            {paragraph.trim()}
          </Text>
        ))}
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
        gap: 10,
      }}>
        {/* Favori + Yeni Masal */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={handleFavorite}
            style={{
              flex: 1,
              backgroundColor: isFavorite ? '#F5A623' : COLORS.card,
              borderWidth: 1,
              borderColor: isFavorite ? '#F5A623' : COLORS.cardBorder,
              borderRadius: 14,
              padding: 12,
              alignItems: 'center',
            }}>
            <Text style={{ color: COLORS.white, fontSize: 13, fontWeight: 'bold' }}>
              {isFavorite ? '★ Favoride' : '☆ Favoriye Ekle'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (sound) {
                sound.unloadAsync();
              }
              navigation.goBack();
            }}
            style={{
              flex: 1,
              backgroundColor: COLORS.accent,
              borderRadius: 14,
              padding: 12,
              alignItems: 'center',
            }}>
            <Text style={{ color: COLORS.white, fontSize: 13, fontWeight: 'bold' }}>
              ✨ Yeni Masal
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
