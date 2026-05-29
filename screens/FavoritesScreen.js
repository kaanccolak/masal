import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, ActivityIndicator, Alert
} from 'react-native';
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
};

export default function FavoritesScreen() {
  const navigation = useNavigation();
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('is_favorite', true)
      .order('created_at', { ascending: false });

    if (error) {
      Alert.alert('Hata', 'Favoriler yüklenemedi.');
    } else {
      setStories(data || []);
    }
    setIsLoading(false);
  };

  const handleStoryPress = (story) => {
    navigation.navigate('Story', {
      story: story.content,
      selectedVoice: story.voice || 'female',
      storyId: story.id,
    });
  };

  const handleRemoveFavorite = async (storyId) => {
    await supabase
      .from('stories')
      .update({ is_favorite: false })
      .eq('id', storyId);
    setStories(prev => prev.filter(s => s.id !== storyId));
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
        <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: 'bold' }}>Favori Masallarım</Text>
        <View style={{ width: 50 }} />
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={COLORS.accent} size="large" />
        </View>
      ) : stories.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🌙</Text>
          <Text style={{ color: COLORS.white, fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
            Henüz favori masalın yok
          </Text>
          <Text style={{ color: COLORS.muted, fontSize: 14, textAlign: 'center', marginTop: 8 }}>
            Beğendiğin masalları favorilere ekle, burada görünsün.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {stories.map((story) => (
            <TouchableOpacity
              key={story.id}
              onPress={() => handleStoryPress(story)}
              style={{
                backgroundColor: COLORS.card,
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: COLORS.cardBorder,
              }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: 'bold', marginBottom: 6 }}>
                    {story.title}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                    {story.age_group && (
                      <View style={{
                        backgroundColor: '#1E2433',
                        borderRadius: 8,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                      }}>
                        <Text style={{ color: COLORS.muted, fontSize: 12 }}>{story.age_group}</Text>
                      </View>
                    )}
                    {story.themes?.slice(0, 2).map((theme, i) => (
                      <View key={i} style={{
                        backgroundColor: '#1E2433',
                        borderRadius: 8,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                      }}>
                        <Text style={{ color: COLORS.muted, fontSize: 12 }}>{theme}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 8 }}>
                    {new Date(story.created_at).toLocaleDateString('tr-TR')}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemoveFavorite(story.id)}
                  style={{ padding: 4 }}>
                  <Text style={{ fontSize: 20 }}>★</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
