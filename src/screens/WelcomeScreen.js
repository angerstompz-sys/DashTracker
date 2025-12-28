import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '../components';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../theme';
import { useUser } from '../context/UserContext';

export const WelcomeScreen = () => {
  const { login } = useUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGetStarted = async () => {
    if (!name.trim() || !email.trim()) {
      alert('Please enter your name and email');
      return;
    }

    setLoading(true);
    try {
      await login(email.toLowerCase().trim(), name.trim());
    } catch (error) {
      alert('Failed to get started. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[colors.background, colors.backgroundLight]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  style={styles.iconGradient}
                >
                  <Ionicons name="car-sport" size={48} color={colors.white} />
                </LinearGradient>
              </View>
              <Text style={styles.title}>DashTracker</Text>
              <Text style={styles.subtitle}>
                Your ultimate companion for delivery tracking
              </Text>
            </View>

            <View style={styles.features}>
              <FeatureItem
                icon="stats-chart"
                title="Track Your Earnings"
                description="Monitor income across all platforms"
              />
              <FeatureItem
                icon="time"
                title="Manage Shifts"
                description="Start and end shifts with one tap"
              />
              <FeatureItem
                icon="analytics"
                title="View Analytics"
                description="Get insights on your performance"
              />
            </View>

            <View style={styles.form}>
              <Input
                label="Full Name"
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                icon={<Ionicons name="person" size={20} color={colors.primary} />}
              />
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                icon={<Ionicons name="mail" size={20} color={colors.primary} />}
              />
              <Button
                title="Get Started"
                onPress={handleGetStarted}
                loading={loading}
                size="large"
                style={styles.button}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const FeatureItem = ({ icon, title, description }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIcon}>
      <Ionicons name={icon} size={24} color={colors.primary} />
    </View>
    <View style={styles.featureText}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  iconGradient: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  features: {
    marginBottom: spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  form: {
    marginTop: spacing.lg,
  },
  button: {
    marginTop: spacing.md,
  },
});
