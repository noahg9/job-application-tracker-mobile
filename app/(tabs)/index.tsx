import React, { useState, useMemo } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Modal,
    TouchableWithoutFeedback,
    ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Swipeable } from 'react-native-gesture-handler';
import { useApplications } from '@/context/ApplicationsContext';
import { Feather } from '@expo/vector-icons';

type Status = 'Applied' | 'Interview' | 'Offer' | 'Rejected';

interface Application {
    id: string;
    company: string;
    position: string;
    status: Status;
    dateApplied: string;
    notes?: string;
}

const STATUS_OPTIONS: Status[] = ['Applied', 'Interview', 'Offer', 'Rejected'];

export default function HomeScreen() {
    const { applications, addApplication, updateApplication, deleteApplication } = useApplications();

    const [company, setCompany] = useState('');
    const [position, setPosition] = useState('');
    const [status, setStatus] = useState<Status>('Applied');
    const [dateApplied, setDateApplied] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [notes, setNotes] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [statusDropdownVisible, setStatusDropdownVisible] = useState(false);
    const [filterStatus, setFilterStatus] = useState<Status | 'All'>('All');
    const [sortBy, setSortBy] = useState<'date' | 'company'>('date');
    const [sortDropdownVisible, setSortDropdownVisible] = useState(false);
    const [filterDropdownVisible, setFilterDropdownVisible] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const resetForm = () => {
        setCompany('');
        setPosition('');
        setStatus('Applied');
        setDateApplied(new Date());
        setNotes('');
        setEditingId(null);
    };

    const openFormForAdd = () => {
        resetForm();
        setIsFormVisible(true);
    };

    const openFormForEdit = (app: Application) => {
        setCompany(app.company);
        setPosition(app.position);
        setStatus(app.status);
        setDateApplied(new Date(app.dateApplied));
        setNotes(app.notes || '');
        setEditingId(app.id);
        setIsFormVisible(true);
    };

    const handleSave = () => {
        if (!company.trim() || !position.trim()) {
            Alert.alert('Error', 'Company and Position are required.');
            return;
        }

        const appData: Application = {
            id: editingId || Date.now().toString(),
            company,
            position,
            status,
            dateApplied: dateApplied.toISOString().split('T')[0],
            notes: notes.trim() || undefined,
        };

        if (editingId) {
            updateApplication(editingId, appData);
        } else {
            addApplication(appData);
        }

        resetForm();
        setIsFormVisible(false);
    };

    const confirmDelete = (id: string) => {
        Alert.alert('Confirm Delete', 'Are you sure you want to delete this?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteApplication(id) },
        ]);
    };

    const filteredSortedSearchedApps = useMemo(() => {
        let filtered = applications;

        if (filterStatus !== 'All') {
            filtered = filtered.filter(app => app.status === filterStatus);
        }

        if (searchQuery.trim() !== '') {
            filtered = filtered.filter(app =>
                app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.position.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        filtered.sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime();
            } else if (sortBy === 'company') {
                return a.company.localeCompare(b.company);
            }
            return 0;
        });

        return filtered;
    }, [applications, filterStatus, searchQuery, sortBy]);


    const renderStatusDropdown = () => {
        if (!statusDropdownVisible) return null;

        return (
            <View style={[styles.dropdownContainer, { position: 'absolute', zIndex: 999 }]}>
                <ScrollView style={styles.dropdown}>
                    {STATUS_OPTIONS.map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={[
                                styles.dropdownItem,
                                option === status && styles.dropdownItemSelected,
                            ]}
                            onPress={() => {
                                setStatus(option);
                                setStatusDropdownVisible(false);
                            }}
                        >
                            <Text
                                style={[
                                    styles.dropdownItemText,
                                    option === status && styles.dropdownItemTextSelected,
                                ]}
                            >
                                {option}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    };

    const renderFilterDropdown = () => {
        if (!filterDropdownVisible) return null;

        return (
            <View style={styles.dropdownWrapper}>
                <View style={styles.dropdownContainer}>
                    <ScrollView style={styles.dropdown}>
                        {['All', ...STATUS_OPTIONS].map((option) => (
                            <TouchableOpacity
                                key={option}
                                style={[
                                    styles.dropdownItem,
                                    option === filterStatus && styles.dropdownItemSelected,
                                ]}
                                onPress={() => {
                                    setFilterStatus(option as Status | 'All');
                                    setFilterDropdownVisible(false);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.dropdownItemText,
                                        option === filterStatus && styles.dropdownItemTextSelected,
                                    ]}
                                >
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        );
    };


    const renderSortDropdown = () => {
        if (!sortDropdownVisible) return null;

        return (
            <View style={styles.dropdownWrapper}>
                <View style={styles.dropdownContainer}>
                    <ScrollView style={styles.dropdown}>
                        {[
                            { label: 'Date Applied', value: 'date' },
                            { label: 'Company', value: 'company' },
                        ].map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.dropdownItem,
                                    option.value === sortBy && styles.dropdownItemSelected,
                                ]}
                                onPress={() => {
                                    setSortBy(option.value as 'date' | 'company');
                                    setSortDropdownVisible(false);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.dropdownItemText,
                                        option.value === sortBy && styles.dropdownItemTextSelected,
                                    ]}
                                >
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        );
    };

    const renderForm = () => (
        <View style={styles.form}>

            <Text style={styles.title}>{editingId ? 'Edit Application' : 'Add Application'}</Text>

            <TextInput placeholder="Company" value={company} onChangeText={setCompany} style={styles.input} />
            <TextInput placeholder="Position" value={position} onChangeText={setPosition} style={styles.input} />

            <View style={styles.row}>
                <View style={styles.flex1}>
                    <Text style={styles.label}>Status</Text>
                    <TouchableOpacity style={styles.statusButton} onPress={() => setStatusDropdownVisible(true)}>
                        <Text style={styles.statusButtonText}>{status}</Text>
                    </TouchableOpacity>
                    {renderStatusDropdown()}
                </View>

                <View style={[styles.flex1, { marginLeft: 12 }]}>
                    <Text style={styles.label}>Date Applied</Text>
                    <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                        <Text style={styles.dateButtonText}>{dateApplied.toDateString()}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {showDatePicker && (
                <DateTimePicker
                    value={dateApplied}
                    mode="date"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) setDateApplied(selectedDate);
                    }}
                    style={{ backgroundColor: '#fff' }}
                />
            )}

            <TextInput
                placeholder="Notes (optional)"
                value={notes}
                onChangeText={setNotes}
                style={[styles.input, styles.notesInput]}
                multiline
            />

            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: editingId ? '#34C759' : '#007AFF' }]}
                    onPress={handleSave}
                >
                    <Text style={styles.buttonText}>{editingId ? 'Update' : 'Add'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                        resetForm();
                        setIsFormVisible(false);
                    }}
                >
                    <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderSwipeActions = (app: Application) => (
        <View style={styles.actionsContainer}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#34C759' }]} onPress={() => openFormForEdit(app)}>
                <Feather name="edit-2" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#FF3B30' }]} onPress={() => confirmDelete(app.id)}>
                <Feather name="trash" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );

    const renderList = () => (
        <View style={{ flex: 1 }}>
            <TouchableOpacity style={styles.addButton} onPress={openFormForAdd}>
                <Text style={styles.addButtonText}>+ Add Application</Text>
            </TouchableOpacity>

            <TextInput
                placeholder="Search by company or position"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={[styles.input, { marginBottom: 16 }]}
            />

            <View style={styles.sortFilterRow}>
                <TouchableOpacity
                    style={styles.sortFilterButton}
                    onPress={() => {
                        setFilterDropdownVisible(true);
                        setSortDropdownVisible(false);
                    }}
                >
                    <Text style={styles.sortFilterText}>Filter: {filterStatus}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.sortFilterButton}
                    onPress={() => {
                        setSortDropdownVisible(true);
                        setFilterDropdownVisible(false);
                    }}
                >
                    <Text style={styles.sortFilterText}>
                        Sort: {sortBy === 'date' ? 'Date Applied' : 'Company'}
                    </Text>
                </TouchableOpacity>
            </View>

            {renderFilterDropdown()}
            {renderSortDropdown()}

            {filteredSortedSearchedApps.length === 0 ? (
                <Text style={styles.emptyText}>No applications found.</Text>
            ) : (
                <FlatList
                        data={filteredSortedSearchedApps}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <Swipeable renderRightActions={() => renderSwipeActions(item)}>
                            <View style={styles.card}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.cardTitle}>
                                        {item.company} - {item.position}
                                    </Text>
                                    <Text>{item.status}</Text>
                                    <Text>{item.dateApplied}</Text>
                                    {item.notes && <Text>{item.notes}</Text>}
                                </View>
                            </View>
                        </Swipeable>
                    )}
                    style={{ marginTop: 10 }}
                />
            )}
        </View>
    );

    return <SafeAreaView style={styles.safeArea}>{isFormVisible ? renderForm() : renderList()}</SafeAreaView>;
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f9f9f9', padding: 16 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
    addButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    emptyText: { textAlign: 'center', marginTop: 40, fontSize: 16, color: '#666' },
    form: { backgroundColor: '#fff', padding: 16, borderRadius: 8 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 12,
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    notesInput: { height: 60 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    flex1: { flex: 1 },
    label: { fontWeight: '600', marginBottom: 6 },
    statusButton: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    statusButtonText: { fontSize: 16, color: '#000' },
    dateButton: {
        padding: 12,
        backgroundColor: '#007AFF',
        borderRadius: 8,
        marginBottom: 12,
    },
    dateButtonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
    saveButton: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        flex: 1,
        marginRight: 8,
    },
    cancelButton: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: '#8E8E93',
        flex: 1,
    },
    buttonText: { color: '#fff', fontWeight: 'bold' },
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        marginBottom: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardTitle: { fontWeight: 'bold', fontSize: 16 },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    dropdownWrapper: {
        position: 'relative',
        width: '100%',
    },

    dropdownContainer: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        maxHeight: 150,
    },
    dropdown: {
        maxHeight: 150,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    dropdownItem: {
        padding: 12,
    },
    dropdownItemSelected: {
        backgroundColor: '#007AFF',
    },
    dropdownItemText: {
        fontSize: 16,
    },
    dropdownItemTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
    },
    actionsContainer: {
        flexDirection: 'row',
        height: '100%',
    },
    actionButton: {
        width: 60,
        justifyContent: 'center',
        alignItems: 'center',
        height: '88%',
        marginVertical: '0%',
        borderRadius: 8,
    },
    sortFilterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    sortFilterButton: {
        flex: 1,
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#eee',
        marginHorizontal: 4,
    },
    sortFilterText: {
        textAlign: 'center',
        fontWeight: '600',
    },
});
