import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../theme';
import { useUser } from '../context/UserContext';
import { getUserStats, getUserShifts, getDatabase } from '../database/db';

export const AnalyticsScreen = () => {
  const { user } = useUser();
  const [stats, setStats] = useState(null);
  const [platformStats, setPlatformStats] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalytics = useCallback(async () => {
    if (!user) return;

    try {
      const userStats = await getUserStats(user.id);
      setStats(userStats);

      // Get platform-wise stats
      const db = getDatabase();
      const platformData = await db.getAllAsync(
        `SELECT
           p.name,
           p.color,
           COUNT(s.id) as shift_count,
           SUM(s.total_earnings) as total_earnings,
           SUM(s.total_deliveries) as total_deliveries,
           SUM(s.total_distance) as total_distance
         FROM platforms p
         LEFT JOIN shifts s ON p.id = s.platform_id AND s.user_id = ?
         WHERE p.user_id = ?
         GROUP BY p.id
         ORDER BY total_earnings DESC`,
        [user.id, user.id]
      );

      setPlatformStats(platformData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  }, [user]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const avgPerShift = stats?.total_shifts > 0
    ? (stats.total_earnings / stats.total_shifts).toFixed(2)
    : '0.00';

  const avgPerDelivery = stats?.total_deliveries > 0
    ? (stats.total_earnings / stats.total_deliveries).toFixed(2)
    : '0.00';

  const avgPerMile = stats?.total_distance > 0
    ? (stats.total_earnings / stats.total_distance).toFixed(2)
    : '0.00';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <LinearGradient colors={[colors.background, colors.backgroundLight]} style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analytics</Text>
        </View>
        <ScrollView
          style={styles.container}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Card variant="gradient" style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total Lifetime Earnings</Text>
            <Text style={styles.totalValue}>${stats?.total_earnings?.toFixed(2) || '0.00'}</Text>
            <View style={styles.totalStats}>
              <TotalStat
                label="Shifts"
                value={stats?.total_shifts || 0}
              />
              <TotalStat
                label="Deliveries"
                value={stats?.total_deliveries || 0}
              />
              <TotalStat
                label="Miles"
                value={stats?.total_distance?.toFixed(1) || '0.0'}
              />
            </View>
          </Card>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Averages</Text>
            <View style={styles.averagesGrid}>
              <AverageCard
                icon="calendar"
                title="Per Shift"
                value={`$${avgPerShift}`}
                color={colors.primary}
              />
              <AverageCard
                icon="receipt"
                title="Per Delivery"
                value={`$${avgPerDelivery}`}
                color={colors.success}
              />
              <AverageCard
                icon="navigate"
                title="Per Mile"
                value={`$${avgPerMile}`}
                color={colors.warning}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Platform Breakdown</Text>
            {platformStats.map((platform, index) => (
              <PlatformCard key={index} platform={platform} />
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Insights</Text>
            <Card style={styles.insightCard}>
              <Ionicons name="bulb" size={32} color={colors.warning} />
              <Text style={styles.insightTitle}>Your Best Platform</Text>
              <Text style={styles.insightText}>
                {platformStats[0]?.name || 'N/A'} has generated the most earnings with $
                {platformStats[0]?.total_earnings?.toFixed(2) || '0.00'}
              </Text>
            </Card>

            <Card style={styles.insightCard}>
              <Ionicons name="trophy" size={32} color={colors.success} />
              <Text style={styles.insightTitle}>Total Completed Shifts</Text>
              <Text style={styles.insightText}>
                You've completed {stats?.total_shifts || 0} shifts and delivered{' '}
                {stats?.total_deliveries || 0} orders!
              </Text>
            </Card>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const TotalStat = ({ label, value }) => (
  <View style={styles.totalStat}>
    <Text style={styles.totalStatValue}>{value}</Text>
    <Text style={styles.totalStatLabel}>{label}</Text>
  </View>
);

const AverageCard = ({ icon, title, value, color }) => (
  <Card style={styles.averageCard}>
    <Ionicons name={icon} size={28} color={color} />
    <Text style={styles.averageValue}>{value}</Text>
    <Text style={styles.averageTitle}>{title}</Text>
  </Card>
);

const PlatformCard = ({ platform }) => {
  const earnings = platform.total_earnings || 0;
  const shifts = platform.shift_count || 0;
  const deliveries = platform.total_deliveries || 0;

  if (shifts === 0) return null;

  return (
    <Card style={styles.platformCard}>
      <View style={styles.platformHeader}>
        <View style={[styles.platformColorDot, { backgroundColor: platform.color }]} />
        <Text style={styles.platformName}>{platform.name}</Text>
      </View>
      <Text style={styles.platformEarnings}>${earnings.toFixed(2)}</Text>
      <View style={styles.platformStats}>
        <PlatformStat label="Shifts" value={shifts} />
        <PlatformStat label="Deliveries" value={deliveries} />
        <PlatformStat label="Avg/Shift" value={`$${(earnings / shifts).toFixed(2)}`} />
      </View>
    </Card>
  );
};

const PlatformStat = ({ label, value }) => (
  <View style={styles.platformStat}>
    <Text style={styles.platformStatValue}>{value}</Text>
    <Text style={styles.platformStatLabel}>{label}</Text>
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
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  container: {
    flex: 1,
  },
  totalCard: {
    margin: spacing.lg,
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  totalLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  totalValue: {
    fontSize: 48,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  totalStats: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  totalStat: {
    alignItems: 'center',
  },
  totalStatValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  totalStatLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  averagesGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  averageCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
  },
  averageValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginVertical: spacing.sm,
  },
  averageTitle: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  platformCard: {
    marginBottom: spacing.md,
  },
  platformHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  platformColorDot: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.full,
    marginRight: spacing.md,
  },
  platformName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  platformEarnings: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.success,
    marginBottom: spacing.md,
  },
  platformStats: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  platformStat: {
    alignItems: 'center',
  },
  platformStatValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  platformStatLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  insightCard: {
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  insightTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginVertical: spacing.sm,
  },
  insightText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
