import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApplications } from '@/context/ApplicationsContext';

export default function StatisticsScreen() {
    const { applications } = useApplications();
    const total = applications.length;

    const countByStatus = (status: string) =>
        applications.filter(app => app.status === status).length;

    const statuses = [
        { label: 'Applied', value: countByStatus('Applied'), color: '#9E9E9E' },
        { label: 'Interviews', value: countByStatus('Interview'), color: '#FFC107' },
        { label: 'Offers', value: countByStatus('Offer'), color: '#34C759' },
        { label: 'Rejections', value: countByStatus('Rejected'), color: '#FF3B30' },
    ];

    const getPercentage = (count: number) =>
        total === 0 ? 0 : Math.round((count / total) * 100);

    const animatedValues = useRef(statuses.map(() => new Animated.Value(0))).current;
    const [animatedNumbers, setAnimatedNumbers] = useState(statuses.map(() => 0));

    useEffect(() => {
        const animations = statuses.map((item, index) =>
            Animated.timing(animatedValues[index], {
                toValue: getPercentage(item.value),
                duration: 800,
                easing: Easing.out(Easing.ease),
                useNativeDriver: false,
            })
        );

        Animated.stagger(150, animations).start();

        const interval = setInterval(() => {
            setAnimatedNumbers(prev =>
                prev.map((num, i) => {
                    const target = getPercentage(statuses[i].value);
                    return num < target ? num + 1 : num;
                })
            );
        }, 8);

        return () => clearInterval(interval);
    }, [applications]);

    const renderCard = (item: any, index: number) => (
        <View style={[styles.statCard, { borderLeftColor: item.color, borderLeftWidth: 5 }]}>
            <View style={styles.statInfo}>
                <Text style={styles.statLabel}>{item.label}</Text>
                <Text style={styles.statValue}>
                    {item.value} ({animatedNumbers[index]}%)
                </Text>
            </View>
            <View style={styles.progressBarBackground}>
                <Animated.View
                    style={[
                        styles.progressBarFill,
                        {
                            width: animatedValues[index].interpolate({
                                inputRange: [0, 100],
                                outputRange: ['0%', '100%'],
                            }),
                            backgroundColor: item.color,
                        },
                    ]}
                />
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>Statistics</Text>

                {total === 0 ? (
                    <Text style={styles.noDataText}>No applications yet.</Text>
                ) : (
                    <>
                        <View style={[styles.statCard, styles.totalCard]}>
                            <View style={styles.statInfo}>
                                <Text style={[styles.statLabel, styles.totalLabel]}>Total Applications</Text>
                                <Text style={[styles.statValue, styles.totalValue]}>{total}</Text>
                            </View>
                        </View>

                        <FlatList
                            data={statuses}
                            keyExtractor={item => item.label}
                            renderItem={({ item, index }) => renderCard(item, index)}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    </>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f9f9f9' },
    container: { flex: 1, padding: 20 },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#111' },
    noDataText: { fontSize: 16, textAlign: 'center', marginTop: 40, color: '#888' },
    statCard: {
        marginBottom: 16,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 3,
    },
    statInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    statLabel: { fontSize: 16, fontWeight: '600', color: '#333' },
    statValue: { fontSize: 16, fontWeight: '700', color: '#111' },
    progressBarBackground: {
        height: 14,
        backgroundColor: '#e0e0e0',
        borderRadius: 7,
        overflow: 'hidden',
    },
    progressBarFill: { height: '100%', borderRadius: 7 },
    totalCard: { backgroundColor: '#007AFF' },
    totalLabel: { color: '#fff', fontWeight: '600' },
    totalValue: { color: '#fff', fontWeight: '700' },
});
