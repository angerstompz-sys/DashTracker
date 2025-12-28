import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../components';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../theme';
import { useUser } from '../context/UserContext';

export const ProfileScreen = () => {
  const { user, logout } = useUser();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const MenuItem = ({ icon, title, onPress, color = colors.text, rightText }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIcon}>
          <Ionicons name={icon} size={24} color={colors.primary} />
        </View>
        <Text style={[styles.menuItemText, { color }]}>{title}</Text>
      </View>
      {rightText ? (
        <Text style={styles.menuRightText}>{rightText}</Text>
      ) : (
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <LinearGradient colors={[colors.background, colors.backgroundLight]} style={styles.gradient}>
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <Card>
              <MenuItem
                icon="person-outline"
                title="Edit Profile"
                onPress={() => Alert.alert('Coming Soon', 'Profile editing will be available soon')}
              />
              <MenuItem
                icon="notifications-outline"
                title="Notifications"
                onPress={() => Alert.alert('Coming Soon', 'Notification settings coming soon')}
              />
              <MenuItem
                icon="shield-checkmark-outline"
                title="Privacy & Security"
                onPress={() => Alert.alert('Coming Soon', 'Privacy settings coming soon')}
              />
            </Card>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Platforms</Text>
            <Card>
              <MenuItem
                icon="grid-outline"
                title="Manage Platforms"
                onPress={() => Alert.alert('Coming Soon', 'Platform management coming soon')}
              />
              <MenuItem
                icon="add-circle-outline"
                title="Add New Platform"
                onPress={() => Alert.alert('Coming Soon', 'Add platform feature coming soon')}
              />
            </Card>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            <Card>
              <MenuItem
                icon="help-circle-outline"
                title="Help & Support"
                onPress={() => Alert.alert('Help', 'Contact support at support@dashtracker.app')}
              />
              <MenuItem
                icon="document-text-outline"
                title="Terms & Conditions"
                onPress={() => Alert.alert('Coming Soon', 'Terms & Conditions coming soon')}
              />
              <MenuItem
                icon="information-circle-outline"
                title="About"
                rightText="v1.0.0"
                onPress={() => Alert.alert('DashTracker', 'Version 1.0.0\n\nYour delivery tracking companion')}
              />
            </Card>
          </View>

          <View style={styles.section}>
            <Card>
              <MenuItem
                icon="log-out-outline"
                title="Logout"
                color={colors.error}
                onPress={handleLogout}
              />
            </Card>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Made with ❤️ for delivery drivers</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

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
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatarGradient: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  userName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuItemText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  menuRightText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
