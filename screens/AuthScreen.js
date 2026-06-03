import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StatusBar, Alert, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  bg: '#0A0E1A',
  card: '#111827',
  accent: '#7C6AF7',
  gold: '#F5A623',
  white: '#FFFFFF',
  muted: '#8892A4',
  cardBorder: '#1E2433',
  input: '#1E2433',
};

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Email ve şifre gerekli.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalı.');
      return;
    }

    setIsLoading(true);
    if (!isLogin && password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor. Lütfen tekrar deneyin.');
      setIsLoading(false);
      return;
    }
    try {
      if (!isLogin) {
        // 1. Device ID al
        let deviceId = await AsyncStorage.getItem('device_unique_id');
        if (!deviceId) {
          deviceId = Crypto.randomUUID();
          await AsyncStorage.setItem('device_unique_id', deviceId);
        }

        // 2. Device ID kontrolü
        const { data: existingDevice } = await supabase
          .from('profiles')
          .select('id')
          .eq('device_id', deviceId)
          .maybeSingle();

        if (existingDevice) {
          Alert.alert(
            'Hesap Mevcut',
            'Bu cihazdan zaten bir hesap oluşturulmuş. Lütfen mevcut hesabınızla giriş yapın.',
            [{ text: 'Tamam', onPress: () => setIsLogin(true) }]
          );
          setIsLoading(false);
          return;
        }

        // 3. Kayıt ol
        console.log('Kayıt deneniyor:', email);
        const { data: signUpData, error } = await supabase.auth.signUp({ email, password });
        console.log('SignUp sonucu:', signUpData, error);
        if (error) throw error;

        if (signUpData?.user?.identities?.length === 0) {
          Alert.alert(
            'Hesap Mevcut',
            'Bu e-posta adresi zaten kayıtlı. Lütfen giriş yapın.',
            [{ text: 'Tamam', onPress: () => setIsLogin(true) }]
          );
          setIsLoading(false);
          return;
        }

        // 4. Device ID kaydet
        await new Promise(resolve => setTimeout(resolve, 1500));
        const { data: { user: newUser } } = await supabase.auth.getUser();
        if (newUser) {
          await supabase
            .from('profiles')
            .upsert({ 
              id: newUser.id, 
              email: newUser.email,
              device_id: deviceId 
            });
        }

        Alert.alert(
          'Hesabın Oluşturuldu! 🌙',
          'E-posta adresine bir doğrulama bağlantısı gönderdik. Lütfen e-postanı kontrol et ve hesabını doğrula, ardından giriş yap.',
          [{ text: 'Tamam', style: 'default' }]
        );
        setIsLogin(true);
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      let errorMessage = 'Bir hata oluştu. Lütfen tekrar dene.';

      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'E-posta veya şifre hatalı. Lütfen tekrar dene.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'E-posta adresin doğrulanmamış. Lütfen e-postanı kontrol et.';
      } else if (error.message.includes('User already registered')) {
        errorMessage = 'Bu e-posta adresi zaten kayıtlı. Lütfen giriş yap.';
      } else if (error.message.includes('Password should be at least')) {
        errorMessage = 'Şifre en az 6 karakter olmalıdır.';
      } else if (error.message.includes('Unable to validate email address')) {
        errorMessage = 'Geçerli bir e-posta adresi girin.';
      } else if (error.message.includes('network')) {
        errorMessage = 'İnternet bağlantını kontrol et.';
      }

      Alert.alert('Hata', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
          
          {/* Logo */}
          <View style={{ alignItems: 'center', marginBottom: 48 }}>
            <Text style={{ fontSize: 60, marginBottom: 12 }}>🌙</Text>
            <Text style={{ color: COLORS.white, fontSize: 28, fontWeight: 'bold' }}>Benim Masalım</Text>
            <Text style={{ color: COLORS.muted, fontSize: 14, marginTop: 6 }}>Her gece yeni bir macera ✨</Text>
          </View>

          {/* Tab seçimi */}
          <View style={{
            flexDirection: 'row',
            backgroundColor: COLORS.card,
            borderRadius: 14,
            padding: 4,
            marginBottom: 24,
          }}>
            <TouchableOpacity
              onPress={() => { setIsLogin(true); setConfirmPassword(''); }}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 10,
                alignItems: 'center',
                backgroundColor: isLogin ? COLORS.accent : 'transparent',
              }}>
              <Text style={{ color: COLORS.white, fontWeight: 'bold' }}>Giriş Yap</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setIsLogin(false); setConfirmPassword(''); }}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 10,
                alignItems: 'center',
                backgroundColor: !isLogin ? COLORS.accent : 'transparent',
              }}>
              <Text style={{ color: COLORS.white, fontWeight: 'bold' }}>Kayıt Ol</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={{ gap: 12, marginBottom: 24 }}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email adresin"
              placeholderTextColor={COLORS.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{
                backgroundColor: COLORS.input,
                borderWidth: 1,
                borderColor: COLORS.cardBorder,
                borderRadius: 12,
                padding: 14,
                color: COLORS.white,
                fontSize: 15,
              }}
            />
            <View style={{ position: 'relative' }}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Şifren"
                placeholderTextColor={COLORS.muted}
                secureTextEntry={!showPassword}
                style={{
                  backgroundColor: COLORS.input,
                  borderWidth: 1,
                  borderColor: COLORS.cardBorder,
                  borderRadius: 12,
                  padding: 14,
                  paddingRight: 48,
                  color: COLORS.white,
                  fontSize: 15,
                }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{ 
                  position: 'absolute', 
                  right: 0, 
                  top: 0, 
                  bottom: 0, 
                  width: 56,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{ fontSize: 22, color: '#8892A4' }}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            {!isLogin && (
              <View style={{ position: 'relative' }}>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Şifre tekrarı"
                  placeholderTextColor={COLORS.muted}
                  secureTextEntry={!showConfirmPassword}
                  style={{
                    backgroundColor: COLORS.input,
                    borderWidth: 1,
                    borderColor: COLORS.cardBorder,
                    borderRadius: 12,
                    padding: 14,
                    paddingRight: 48,
                    color: COLORS.white,
                    fontSize: 15,
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ 
                    position: 'absolute', 
                    right: 0, 
                    top: 0, 
                    bottom: 0, 
                    width: 56,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text style={{ fontSize: 22, color: '#8892A4' }}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Buton */}
          <TouchableOpacity
            onPress={handleAuth}
            disabled={isLoading}
            style={{
              backgroundColor: COLORS.accent,
              borderRadius: 14,
              padding: 16,
              alignItems: 'center',
              opacity: isLoading ? 0.7 : 1,
            }}>
            {isLoading
              ? <ActivityIndicator color="#fff" />
              : <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: 'bold' }}>
                  {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
                </Text>
            }
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
