import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Radius, Spacing, Typography } from '../theme';
import { usePlayerStore } from '../store/playerStore';
import { usePlayer } from '../hooks/usePlayer';
import { getHighestQualityImage, getPrimaryArtistName } from '../utils/helpers';

const MiniPlayer: React.FC = () => {
    const navigation = useNavigation<any>();
    const { colors, isDark } = useTheme();
    const { togglePlay, skipToNext } = usePlayer();
    const currentSong = usePlayerStore((s) => s.currentSong);
    const isPlaying = usePlayerStore((s) => s.isPlaying);
    const position = usePlayerStore((s) => s.position);
    const duration = usePlayerStore((s) => s.duration);

    if (!currentSong) return null;

    const imageUrl = getHighestQualityImage(currentSong.image);
    const artist = getPrimaryArtistName(currentSong);
    const progress = duration > 0 ? Math.min(position / duration, 1) : 0;

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border, shadowColor: isDark ? '#000' : '#999' }]}
            onPress={() => navigation.navigate('Player')}
            activeOpacity={0.95}
        >
            {/* Progress bar */}
            <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
                <View style={[styles.progressFill, { backgroundColor: colors.accent, width: `${progress * 100}%` }]} />
            </View>

            <View style={styles.inner}>
                {/* Art */}
                {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={[styles.art, { borderRadius: Radius.sm }]} />
                ) : (
                    <View style={[styles.art, { backgroundColor: colors.card, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' }]}>
                        <Ionicons name="musical-note" size={18} color={colors.textMuted} />
                    </View>
                )}

                {/* Info */}
                <View style={styles.info}>
                    <Text style={[styles.songName, { color: colors.textPrimary }]} numberOfLines={1}>
                        {currentSong.name}
                    </Text>
                    <Text style={[styles.artistName, { color: colors.textSecondary }]} numberOfLines={1}>
                        {artist}
                    </Text>
                </View>

                {/* Controls */}
                <TouchableOpacity
                    style={[styles.ctrlBtn, { backgroundColor: colors.accentLight }]}
                    onPress={(e) => { e.stopPropagation?.(); togglePlay(); }}
                >
                    <Ionicons
                        name={isPlaying ? 'pause' : 'play'}
                        size={20}
                        color={colors.accent}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.nextBtn}
                    onPress={(e) => { e.stopPropagation?.(); skipToNext(); }}
                >
                    <Ionicons name="play-skip-forward" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 64, // above tab bar
        left: 0,
        right: 0,
        borderTopWidth: StyleSheet.hairlineWidth,
        elevation: 12,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    progressBg: { height: 2 },
    progressFill: { height: 2 },
    inner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: 10,
        gap: 12,
    },
    art: { width: 44, height: 44 },
    info: { flex: 1 },
    songName: { ...Typography.bodyBold, marginBottom: 2 },
    artistName: { ...Typography.caption },
    ctrlBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
});

export default MiniPlayer;
