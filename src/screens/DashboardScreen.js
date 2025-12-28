import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../components';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../theme';
import { useUser } from '../context/UserContext';
import {
  getActiveShift,
  getUserShifts,
  getUserStats,
  startShift,
  endShift,
  getUserPlatforms,
} from '../database/db';
import { format } from 'date-fns';

export const DashboardScreen = ({ navigation }) => {
  const { user } = useUser();
  const [activeShift, setActiveShift] = useState(null);
  const [recentShifts, setRecentShifts] = useState([]);
  const [stats, setStats] = useState(null);
  const [platforms, setPlatforms] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showPlatformSelect, setShowPlatformSelect] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      const [active, shifts, userStats, userPlatforms] = await Promise.all([
        getActiveShift(user.id),
        getUserShifts(user.id, 5),
        getUserStats(user.id),
        getUserPlatforms(user.id),
      ]);

      setActiveShift(active);
      setRecentShifts(shifts);
      setStats(userStats);
      setPlatforms(userPlatforms);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleStartShift = async (platformId) => {
    try {
      await startShift(user.id, platformId);
      await loadData();
      setShowPlatformSelect(false);
    } catch (error) {
      console.error('Error starting shift:', error);
    }
  };

  const handleEndShift = async () => {
    if (!activeShift) return;

    try {
      await endShift(activeShift.id);
      await loadData();
    } catch (error) {
      console.error('Error ending shift:', error);
    }
  };

  const getShiftDuration = () => {
    if (!activeShift?.start_time) return '00:00:00';

    const start = new Date(activeShift.start_time);
    const now = new Date();
    const diff = now - start;

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <LinearGradient colors={[colors.background, colors.backgroundLight]} style={styles.gradient}>
        <ScrollView
          style={styles.container}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hello,</Text>
              <Text style={styles.name}>{user?.name}</Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <Ionicons name="person-circle" size={40} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {activeShift ? (
            <Card variant="gradient" style={styles.activeShiftCard}>
              <View style={styles.activeShiftHeader}>
                <View style={styles.platformBadge}>
                  <Text style={styles.platformBadgeText}>{activeShift.platform_name}</Text>
                </View>
                <Text style={styles.activeShiftStatus}>Active Shift</Text>
              </View>

              <Text style={styles.shiftTimer}>{getShiftDuration()}</Text>

              <View style={styles.shiftStats}>
                <ShiftStat
                  icon="cash"
                  label="Earnings"
                  value={`$${activeShift.total_earnings?.toFixed(2) || '0.00'}`}
                />
                <ShiftStat
                  icon="navigate"
                  label="Distance"
                  value={`${activeShift.total_distance?.toFixed(1) || '0.0'} mi`}
                />
                <ShiftStat
                  icon="receipt"
                  label="Deliveries"
                  value={activeShift.total_deliveries || 0}
                />
              </View>

              <View style={styles.shiftActions}>
                <Button
                  title="Add Delivery"
                  onPress={() => navigation.navigate('AddDelivery', { shiftId: activeShift.id })}
                  variant="primary"
                  style={styles.actionButton}
                />
                <Button
                  title="End Shift"
                  onPress={handleEndShift}
                  variant="outline"
                  style={styles.actionButton}
                />
              </View>
            </Card>
          ) : showPlatformSelect ? (
            <Card style={styles.platformSelectCard}>
              <Text style={styles.platformSelectTitle}>Select Platform</Text>
              {platforms.map((platform) => (
                <TouchableOpacity
                  key={platform.id}
                  style={styles.platformOption}
                  onPress={() => handleStartShift(platform.id)}
                >
                  <View
                    style={[styles.platformColor, { backgroundColor: platform.color || colors.primary }]}
                  />
                  <Text style={styles.platformName}>{platform.name}</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
              <Button
                title="Cancel"
                onPress={() => setShowPlatformSelect(false)}
                variant="outline"
                style={styles.cancelButton}
              />
            </Card>
          ) : (
            <Card variant="gradient" style={styles.startShiftCard}>
              <Ionicons name="play-circle" size={64} color={colors.primary} />
              <Text style={styles.startShiftText}>Ready to start earning?</Text>
              <Button title="Start Shift" onPress={() => setShowPlatformSelect(true)} size="large" />
            </Card>
          )}

          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Your Stats</Text>
            <View style={styles.statsGrid}>
              <StatCard
                icon="trending-up"
                title="Total Earnings"
                value={`$${stats?.total_earnings?.toFixed(2) || '0.00'}`}
                color={colors.success}
              />
              <StatCard
                icon="calendar"
                title="Total Shifts"
                value={stats?.total_shifts || 0}
                color={colors.info}
              />
              <StatCard
                icon="location"
                title="Total Distance"
                value={`${stats?.total_distance?.toFixed(1) || '0.0'} mi`}
                color={colors.warning}
              />
              <StatCard
                icon="receipt"
                title="Deliveries"
                value={stats?.total_deliveries || 0}
                color={colors.secondary}
              />
            </View>
          </View>

          <View style={styles.recentShifts}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Shifts</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Shifts')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {recentShifts.map((shift) => (
              <ShiftCard key={shift.id} shift={shift} />
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const ShiftStat = ({ icon, label, value }) => (
  <View style={styles.shiftStat}>
    <Ionicons name={icon} size={20} color={colors.primary} style={styles.shiftStatIcon} />
    <Text style={styles.shiftStatLabel}>{label}</Text>
    <Text style={styles.shiftStatValue}>{value}</Text>
  </View>
);

const StatCard = ({ icon, title, value, color }) => (
  <Card style={styles.statCard}>
    <Ionicons name={icon} size={24} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </Card>
);

const ShiftCard = ({ shift }) => (
  <Card style={styles.shiftCard}>
    <View style={styles.shiftCardHeader}>
      <View style={[styles.shiftPlatformDot, { backgroundColor: shift.platform_color }]} />
      <Text style={styles.shiftPlatformName}>{shift.platform_name}</Text>
      <Text style={styles.shiftDate}>
        {format(new Date(shift.start_time), 'MMM dd, yyyy')}
      </Text>
    </View>
    <View style={styles.shiftCardStats}>
      <Text style={styles.shiftCardEarnings}>${shift.total_earnings?.toFixed(2)}</Text>
      <Text style={styles.shiftCardDetail}>
        {shift.total_deliveries} deliveries • {shift.total_distance?.toFixed(1)} mi
      </Text>
    </View>
  </Card>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  greeting: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  name: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  profileButton: {
    padding: spacing.xs,
  },
  activeShiftCard: {
    margin: spacing.lg,
  },
  activeShiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  platformBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  platformBadgeText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  activeShiftStatus: {
    color: colors.success,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  shiftTimer: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  shiftStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  shiftStat: {
    alignItems: 'center',
  },
  shiftStatIcon: {
    marginBottom: spacing.xs,
  },
  shiftStatLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  shiftStatValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  shiftActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  platformSelectCard: {
    margin: spacing.lg,
  },
  platformSelectTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  platformOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  platformColor: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
  },
  platformName: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  cancelButton: {
    marginTop: spacing.md,
  },
  startShiftCard: {
    margin: spacing.lg,
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  startShiftText: {
    fontSize: fontSize.lg,
    color: colors.text,
    marginVertical: spacing.lg,
  },
  statsContainer: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: spacing.md,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginVertical: spacing.xs,
  },
  statTitle: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  recentShifts: {
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  seeAllText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  shiftCard: {
    marginBottom: spacing.md,
  },
  shiftCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  shiftPlatformDot: {
    width: 12,
    height: 12,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  shiftPlatformName: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  shiftDate: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  shiftCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shiftCardEarnings: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.success,
  },
  shiftCardDetail: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
