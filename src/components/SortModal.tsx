import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Radius, Spacing, Typography } from '../theme';

export type SortOption =
    | 'ascending'
    | 'descending'
    | 'artist'
    | 'album'
    | 'year'
    | 'date_added'
    | 'date_modified'
    | 'composer';

const OPTIONS: { value: SortOption; label: string }[] = [
    { value: 'ascending', label: 'Ascending' },
    { value: 'descending', label: 'Descending' },
    { value: 'artist', label: 'Artist' },
    { value: 'album', label: 'Album' },
    { value: 'year', label: 'Year' },
    { value: 'date_added', label: 'Date Added' },
    { value: 'date_modified', label: 'Date Modified' },
    { value: 'composer', label: 'Composer' },
];

interface Props {
    visible: boolean;
    selected: SortOption;
    onChange: (opt: SortOption) => void;
    onClose: () => void;
}

const SortModal: React.FC<Props> = ({ visible, selected, onChange, onClose }) => {
    const { colors } = useTheme();
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            />
            <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>Sort by</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                {/* Options */}
                <View style={styles.optionsContainer}>
                    {OPTIONS.map((opt) => {
                        const isSelected = selected === opt.value;
                        return (
                            <TouchableOpacity
                                key={opt.value}
                                style={styles.option}
                                onPress={() => { onChange(opt.value); onClose(); }}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.radioOuter, { borderColor: isSelected ? colors.accent : colors.textMuted }]}>
                                    {isSelected && <View style={[styles.radioInner, { backgroundColor: colors.accent }]} />}
                                </View>
                                <Text style={[styles.optLabel, { color: isSelected ? colors.accent : colors.textPrimary }]}>
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingBottom: 40,
        paddingTop: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.xl,
        paddingVertical: 16,
        marginBottom: 8,
    },
    title: { ...Typography.h2, fontSize: 20 },
    optionsContainer: {
        paddingHorizontal: Spacing.xl,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        gap: 16,
    },
    optLabel: { ...Typography.bodyBold, fontSize: 16 },
    radioOuter: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
});

export default SortModal;
