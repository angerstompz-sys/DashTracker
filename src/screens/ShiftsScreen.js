import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../theme';
import { useUser } from '../context/UserContext';
import { getUserShifts, getShiftDeliveries } from '../database/db';
import { format, formatDuration, intervalToDuration } from 'date-fns';

export const ShiftsScreen = ({ navigation }) => {
  const { user } = useUser();
  const [shifts, setShifts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedShift, setExpandedShift] = useState(null);
  const [deliveries, setDeliveries] = useState({});

  const loadShifts = useCallback(async () => {
    if (!user) return;

    try {
      const userShifts = await getUserShifts(user.id, 50);
      setShifts(userShifts);
    } catch (error) {
      console.error('Error loading shifts:', error);
    }
  }, [user]);

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadShifts();
    setRefreshing(false);
  };

  const toggleShiftExpansion = async (shiftId) => {
    if (expandedShift === shiftId) {
      setExpandedShift(null);
    } else {
      setExpandedShift(shiftId);
      if (!deliveries[shiftId]) {
        const shiftDeliveries = await getShiftDeliveries(shiftId);
        setDeliveries((prev) => ({ ...prev, [shiftId]: shiftDeliveries }));
      }
    }
  };

  const getShiftDuration = (shift) => {
    if (!shift.end_time) return 'Active';

    const start = new Date(shift.start_time);
    const end = new Date(shift.end_time);
    const duration = intervalToDuration({ start, end });

    return formatDuration(duration, { format: ['hours', 'minutes'] });
  };

  const renderShift = ({ item: shift }) => {
    const isExpanded = expandedShift === shift.id;
    const shiftDeliveries = deliveries[shift.id] || [];

    return (
      <Card style={styles.shiftCard}>
        <TouchableOpacity onPress={() => toggleShiftExpansion(shift.id)}>
          <View style={styles.shiftHeader}>
            <View style={styles.shiftHeaderLeft}>
              <View style={[styles.platformDot, { backgroundColor: shift.platform_color }]} />
              <View>
                <Text style={styles.platformName}>{shift.platform_name}</Text>
                <Text style={styles.shiftDate}>
                  {format(new Date(shift.start_time), 'EEEE, MMM dd, yyyy')}
                </Text>
              </View>
            </View>
            <View style={styles.shiftHeaderRight}>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={24}
                color={colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.shiftMainStats}>
            <View style={styles.earningsContainer}>
              <Text style={styles.earningsLabel}>Total Earnings</Text>
              <Text style={styles.earningsValue}>${shift.total_earnings?.toFixed(2)}</Text>
            </View>
            <View style={styles.shiftMetrics}>
              <ShiftMetric
                icon="time"
                value={getShiftDuration(shift)}
                label="Duration"
              />
              <ShiftMetric
                icon="navigate"
                value={`${shift.total_distance?.toFixed(1)} mi`}
                label="Distance"
              />
              <ShiftMetric
                icon="receipt"
                value={shift.total_deliveries}
                label="Deliveries"
              />
            </View>
          </View>

          {shift.status === 'active' && (
            <View style={styles.activebadge}>
              <View style={styles.activeDot} />
              <Text style={styles.activeText}>Active Shift</Text>
            </View>
          )}
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.divider} />
            <Text style={styles.deliveriesTitle}>Deliveries ({shiftDeliveries.length})</Text>
            {shiftDeliveries.length > 0 ? (
              shiftDeliveries.map((delivery, index) => (
                <View key={delivery.id} style={styles.deliveryItem}>
                  <View style={styles.deliveryNumber}>
                    <Text style={styles.deliveryNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.deliveryInfo}>
                    <Text style={styles.deliveryEarnings}>${delivery.earnings.toFixed(2)}</Text>
                    <Text style={styles.deliveryDetails}>
                      Base: ${delivery.base_pay?.toFixed(2)} • Tip: ${delivery.tip?.toFixed(2)}
                      {delivery.distance && ` • ${delivery.distance.toFixed(1)} mi`}
                    </Text>
                    {delivery.notes && (
                      <Text style={styles.deliveryNotes}>{delivery.notes}</Text>
                    )}
                  </View>
                  <Text style={styles.deliveryTime}>
                    {format(new Date(delivery.timestamp), 'h:mm a')}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noDeliveries}>No deliveries recorded yet</Text>
            )}
          </View>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <LinearGradient colors={[colors.background, colors.backgroundLight]} style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Shifts</Text>
        </View>
        <FlatList
          data={shifts}
          renderItem={renderShift}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={64} color={colors.textMuted} />
              <Text style={styles.emptyText}>No shifts yet</Text>
              <Text style={styles.emptySubtext}>Start a shift to begin tracking</Text>
            </View>
          }
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const ShiftMetric = ({ icon, value, label }) => (
  <View style={styles.metric}>
    <Ionicons name={icon} size={16} color={colors.primary} />
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
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
  listContent: {
    padding: spacing.lg,
  },
  shiftCard: {
    marginBottom: spacing.md,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  shiftHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  platformDot: {
    width: 16,
    height: 16,
    borderRadius: borderRadius.full,
    marginRight: spacing.md,
  },
  platformName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  shiftDate: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  shiftHeaderRight: {
    padding: spacing.xs,
  },
  shiftMainStats: {
    marginBottom: spacing.sm,
  },
  earningsContainer: {
    marginBottom: spacing.md,
  },
  earningsLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  earningsValue: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.success,
  },
  shiftMetrics: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.xs,
  },
  metricLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  activebadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success,
    marginRight: spacing.sm,
  },
  activeText: {
    fontSize: fontSize.sm,
    color: colors.success,
    fontWeight: fontWeight.medium,
  },
  expandedContent: {
    marginTop: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  deliveriesTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  deliveryNumber: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  deliveryNumberText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryEarnings: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.success,
    marginBottom: spacing.xs,
  },
  deliveryDetails: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  deliveryNotes: {
    fontSize: fontSize.sm,
    color: colors.text,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  deliveryTime: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  noDeliveries: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxl * 2,
  },
  emptyText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.lg,
  },
  emptySubtext: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
