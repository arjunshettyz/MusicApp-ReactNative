import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Radius, Spacing, Typography } from '../theme';
import { Song } from '../types';
import { getHighestQualityImage, getPrimaryArtistName, formatTime } from '../utils/helpers';
import SongContextMenu from './SongContextMenu';
import { usePlayer } from '../hooks/usePlayer';
import { useNavigation } from '@react-navigation/native';

interface Props {
    song: Song;
    onPress: (song: Song) => void;
    index?: number;
    isActive?: boolean;
    showIndex?: boolean;
}

const SongCard: React.FC<Props> = React.memo(({ song, onPress, index, isActive = false, showIndex = false }) => {
    const { colors } = useTheme();
    const navigation = useNavigation<any>();
    const { playSong } = usePlayer();
    const [showMenu, setShowMenu] = useState(false);

    const imageUrl = getHighestQualityImage(song.image);
    const artistName = getPrimaryArtistName(song);
    const duration = song.duration ? formatTime(song.duration) : '';

    return (
        <>
            <TouchableOpacity
                style={[styles.container, { borderBottomColor: colors.divider }]}
                onPress={() => onPress(song)}
                activeOpacity={0.75}
            >
                {/* Thumbnail */}
                <View style={styles.thumbWrap}>
                    {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={[styles.thumb, { borderRadius: Radius.sm }]} />
                    ) : (
                        <View style={[styles.thumb, { backgroundColor: colors.card, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' }]}>
                            <Ionicons name="musical-note" size={20} color={colors.textMuted} />
                        </View>
                    )}
                    {isActive && (
                        <View style={[styles.activeOverlay, { backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: Radius.sm }]}>
                            <Ionicons name="volume-high" size={14} color={colors.accent} />
                        </View>
                    )}
                </View>

                {/* Info */}
                <View style={styles.info}>
                    <Text
                        style={[styles.songName, { color: isActive ? colors.accent : colors.textPrimary }]}
                        numberOfLines={1}
                    >
                        {song.name}
                    </Text>
                    <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
                        {artistName}{duration ? `  ·  ${duration}` : ''}
                    </Text>
                </View>

                {/* Play button */}
                <TouchableOpacity
                    style={[styles.playBtn, { backgroundColor: colors.accent }]}
                    onPress={() => onPress(song)}
                >
                    <Ionicons name="play" size={13} color="#FFF" />
                </TouchableOpacity>

                {/* Three-dot menu */}
                <TouchableOpacity style={styles.moreBtn} onPress={() => setShowMenu(true)}>
                    <Ionicons name="ellipsis-vertical" size={18} color={colors.textMuted} />
                </TouchableOpacity>
            </TouchableOpacity>

            {showMenu && (
                <SongContextMenu
                    song={song}
                    visible={showMenu}
                    onClose={() => setShowMenu(false)}
                    onNavigateToArtist={() => {
                        setShowMenu(false);
                        // Could navigate to artist if needed
                    }}
                />
            )}
        </>
    );
});

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        gap: 12,
    },
    thumbWrap: { position: 'relative' },
    thumb: { width: 50, height: 50 },
    activeOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    info: { flex: 1 },
    songName: { ...Typography.bodyBold, marginBottom: 2 },
    meta: { ...Typography.caption },
    playBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    moreBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
});

export default SongCard;
