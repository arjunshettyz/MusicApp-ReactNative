import { ImageQuality, DownloadUrl } from '../types';

export const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const getHighestQualityImage = (images: ImageQuality[]): string => {
    if (!images || images.length === 0) return '';
    // Try to find 500x500 first, then fallback to last (usually highest quality)
    const high = images.find((img) => img.quality === '500x500');
    if (high) return high.url;
    return images[images.length - 1]?.url ?? '';
};

export const getHighestQualityUrl = (urls: DownloadUrl[]): string => {
    if (!urls || urls.length === 0) return '';
    // 320kbps is highest quality
    const hq = urls.find((u) => u.quality === '320kbps');
    if (hq) return hq.url;
    // fallback to highest available
    return urls[urls.length - 1]?.url ?? '';
};

export const getPrimaryArtistName = (song: {
    artists?: { primary?: Array<{ name: string }> };
}): string => {
    const primary = song.artists?.primary;
    if (!primary || primary.length === 0) return 'Unknown Artist';
    return primary.map((a) => a.name).join(', ');
};
