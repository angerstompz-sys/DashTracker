import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, Card } from '../components';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../theme';
import { addDelivery } from '../database/db';

export const AddDeliveryScreen = ({ route, navigation }) => {
  const { shiftId } = route.params;
  const [basePay, setBasePay] = useState('');
  const [tip, setTip] = useState('');
  const [distance, setDistance] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateTotal = () => {
    const base = parseFloat(basePay) || 0;
    const tipAmount = parseFloat(tip) || 0;
    return (base + tipAmount).toFixed(2);
  };

  const handleSubmit = async () => {
    const base = parseFloat(basePay) || 0;
    const tipAmount = parseFloat(tip) || 0;
    const totalEarnings = base + tipAmount;

    if (totalEarnings === 0) {
      Alert.alert('Error', 'Please enter at least base pay or tip amount');
      return;
    }

    setLoading(true);
    try {
      await addDelivery(
        shiftId,
        totalEarnings,
        parseFloat(distance) || 0,
        tipAmount,
        base,
        notes.trim()
      );

      Alert.alert('Success', 'Delivery added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error adding delivery:', error);
      Alert.alert('Error', 'Failed to add delivery. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <LinearGradient colors={[colors.background, colors.backgroundLight]} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.header}>
            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="outline"
              size="small"
            />
            <Text style={styles.headerTitle}>Add Delivery</Text>
            <View style={{ width: 80 }} />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Card variant="gradient" style={styles.totalCard}>
              <Text style={styles.totalLabel}>Total Earnings</Text>
              <Text style={styles.totalValue}>${calculateTotal()}</Text>
            </Card>

            <Card style={styles.formCard}>
              <Input
                label="Base Pay"
                value={basePay}
                onChangeText={setBasePay}
                placeholder="0.00"
                keyboardType="decimal-pad"
                icon={<Ionicons name="cash-outline" size={20} color={colors.primary} />}
              />

              <Input
                label="Tip Amount"
                value={tip}
                onChangeText={setTip}
                placeholder="0.00"
                keyboardType="decimal-pad"
                icon={<Ionicons name="gift-outline" size={20} color={colors.primary} />}
              />

              <Input
                label="Distance (miles) - Optional"
                value={distance}
                onChangeText={setDistance}
                placeholder="0.0"
                keyboardType="decimal-pad"
                icon={<Ionicons name="navigate-outline" size={20} color={colors.primary} />}
              />

              <Input
                label="Notes - Optional"
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any notes about this delivery"
                icon={<Ionicons name="document-text-outline" size={20} color={colors.primary} />}
              />
            </Card>

            <View style={styles.tips}>
              <Text style={styles.tipsTitle}>Quick Tips</Text>
              <View style={styles.tipItem}>
                <Ionicons name="information-circle" size={16} color={colors.info} />
                <Text style={styles.tipText}>
                  Enter the base pay and tip separately for better analytics
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="information-circle" size={16} color={colors.info} />
                <Text style={styles.tipText}>
                  Distance helps calculate your earnings per mile
                </Text>
              </View>
            </View>

            <Button
              title="Add Delivery"
              onPress={handleSubmit}
              loading={loading}
              size="large"
              style={styles.submitButton}
            />
          </ScrollView>
        </KeyboardAvoidingView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  totalCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },
  totalLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  totalValue: {
    fontSize: 48,
    fontWeight: fontWeight.bold,
    color: colors.success,
  },
  formCard: {
    marginBottom: spacing.lg,
  },
  tips: {
    marginBottom: spacing.lg,
  },
  tipsTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  submitButton: {
    marginBottom: spacing.xl,
  },
});
