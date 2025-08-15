import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApplications } from '@/context/ApplicationsContext';

export default function StatisticsScreen() {
    const { applications } = useApplications();

    const total = applications.length;

    const countByStatus = (status: string) =>
        applications.filter(app => app.status === status).length;

    const statuses = [
        { label: 'Applications Sent', value: total, color: '#007AFF' },
        { label: 'Interviews', value: countByStatus('Interview'), color: '#34C759' },
        { label: 'Offers', value: countByStatus('Offer'), color: '#FFD60A' },
        { label: 'Rejections', value: countByStatus('Rejected'), color: '#FF3B30' },
    ];

    const getPercentage = (count: number) =>
        total === 0 ? 0 : Math.round((count / total) * 100);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {total === 0 ? (
                    <Text style={styles.noDataText}>No applications yet.</Text>
                ) : (
                    <FlatList
                        data={statuses}
                        keyExtractor={item => item.label}
                        renderItem={({ item }) => (
                            <View style={styles.statCard}>
                                <View style={styles.statInfo}>
                                    <Text style={styles.statLabel}>{item.label}:</Text>
                                    <Text style={styles.statValue}>
                                        {item.value} ({getPercentage(item.value)}%)
                                    </Text>
                                </View>
                                <View style={styles.progressBarBackground}>
                                    <View
                                        style={[
                                            styles.progressBarFill,
                                            {
                                                width: `${getPercentage(item.value)}%`,
                                                backgroundColor: item.color,
                                            },
                                        ]}
                                    />
                                </View>
                            </View>
                        )}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    noDataText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 40,
        color: '#888',
    },
    statCard: {
        marginBottom: 16,
    },
    statInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    statLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    statValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    progressBarBackground: {
        height: 12,
        backgroundColor: '#e0e0e0',
        borderRadius: 6,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 6,
    },
});