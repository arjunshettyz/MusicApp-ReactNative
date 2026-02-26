import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Switch,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Radius, Spacing, Typography } from '../theme';

type ThemeMode = 'system' | 'light' | 'dark';

const SettingsScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const { colors, mode, setMode, isDark } = useTheme();
    const [crossfade, setCrossfade] = React.useState(false);
    const [gapless, setGapless] = React.useState(true);
    const [highQuality, setHighQuality] = React.useState(true);

    const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{title.toUpperCase()}</Text>
            <View style={[styles.sectionCard, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
                {children}
            </View>
        </View>
    );

    const ToggleRow: React.FC<{
        icon: string;
        label: string;
        value: boolean;
        onChange: (v: boolean) => void;
        isLast?: boolean;
    }> = ({ icon, label, value, onChange, isLast }) => (
        <View style={[styles.row, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider }]}>
            <View style={[styles.iconWrap, { backgroundColor: colors.accentLight }]}>
                <Ionicons name={icon as any} size={18} color={colors.accent} />
            </View>
            <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>{label}</Text>
            <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor="#FFF"
            />
        </View>
    );

    const ThemeOption: React.FC<{ value: ThemeMode; label: string; icon: string }> = ({ value, label, icon }) => (
        <TouchableOpacity
            style={[styles.row, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider }]}
            onPress={() => setMode(value)}
            activeOpacity={0.7}
        >
            <View style={[styles.iconWrap, { backgroundColor: value === mode ? colors.accentLight : colors.bgTertiary }]}>
                <Ionicons name={icon as any} size={18} color={value === mode ? colors.accent : colors.textMuted} />
            </View>
            <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>{label}</Text>
            <View style={[
                styles.radio,
                value === mode ? { backgroundColor: colors.accent, borderColor: colors.accent } : { borderColor: colors.border },
            ]}>
                {value === mode && <Ionicons name="checkmark" size={12} color="#FFF" />}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Settings</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Appearance */}
                <Section title="Appearance">
                    <ThemeOption value="system" label="Follow System" icon="phone-portrait-outline" />
                    <ThemeOption value="light" label="Light Mode" icon="sunny-outline" />
                    <ThemeOption value="dark" label="Dark Mode" icon="moon-outline" />
                </Section>

                {/* Playback */}
                <Section title="Playback">
                    <ToggleRow icon="musical-notes-outline" label="Crossfade" value={crossfade} onChange={setCrossfade} />
                    <ToggleRow icon="pause-circle-outline" label="Gapless Playback" value={gapless} onChange={setGapless} />
                    <ToggleRow icon="star-outline" label="High Quality Audio" value={highQuality} onChange={setHighQuality} isLast />
                </Section>

                {/* About */}
                <Section title="About">
                    <View style={[styles.row, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider }]}>
                        <View style={[styles.iconWrap, { backgroundColor: colors.accentLight }]}>
                            <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
                        </View>
                        <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>Version</Text>
                        <Text style={[styles.rowValue, { color: colors.textMuted }]}>1.0.0</Text>
                    </View>
                    <View style={styles.row}>
                        <View style={[styles.iconWrap, { backgroundColor: colors.accentLight }]}>
                            <Ionicons name="cloud-outline" size={18} color={colors.accent} />
                        </View>
                        <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>Music Source</Text>
                        <Text style={[styles.rowValue, { color: colors.textMuted }]}>JioSaavn</Text>
                    </View>
                </Section>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    title: { ...Typography.h2 },
    section: { marginTop: 24, paddingHorizontal: Spacing.lg },
    sectionTitle: { ...Typography.tiny, marginBottom: 8, letterSpacing: 1 },
    sectionCard: {
        borderRadius: Radius.md,
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: 13,
        gap: 14,
    },
    iconWrap: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowLabel: { ...Typography.body, flex: 1 },
    rowValue: { ...Typography.caption },
    radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default SettingsScreen;
