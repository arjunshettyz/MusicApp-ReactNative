import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import PlayerScreen from '../screens/PlayerScreen';
import QueueScreen from '../screens/QueueScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SearchScreen from '../screens/SearchScreen';
import ArtistScreen from '../screens/ArtistScreen';
import AlbumScreen from '../screens/AlbumScreen';
import MiniPlayer from '../components/MiniPlayer';
import { usePlayerStore } from '../store/playerStore';
import { useTheme } from '../context/ThemeContext';


import { Song } from '../types';

export type RootStackParamList = {
    Tabs: undefined;
    Player: undefined;
    Queue: undefined;
    Search: undefined;
    Artist: { id?: string; name: string; songs?: Song[] };
    Album: { id: string | null; name: string };
};

export type TabParamList = {
    Home: undefined;
    Favorites: undefined;
    Playlists: undefined;
    Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createMaterialTopTabNavigator<TabParamList>();

const TabNavigator: React.FC = () => {
    const { colors } = useTheme();
    const { width } = useWindowDimensions();
    return (
        <Tab.Navigator
            tabBarPosition="bottom"
            initialLayout={{ width }}
            screenOptions={({ route }) => ({
                swipeEnabled: true,
                animationEnabled: true,
                lazy: true,
                tabBarActiveTintColor: colors.accent,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: colors.tabBar,
                    borderTopColor: colors.tabBarBorder,
                    borderTopWidth: 1,
                    height: 60,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                tabBarIndicatorStyle: {
                    backgroundColor: colors.accent,
                    top: 0,
                    height: 4,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '700',
                    textTransform: 'none',
                    margin: 0,
                    paddingBottom: 4,
                },
                tabBarIconStyle: {
                    marginTop: 4,
                },
                tabBarShowIcon: true,
                tabBarPressColor: 'transparent',
                tabBarIcon: ({ color, focused }) => {
                    let iconName: string;
                    switch (route.name) {
                        case 'Home': iconName = focused ? 'home' : 'home-outline'; break;
                        case 'Favorites': iconName = focused ? 'heart' : 'heart-outline'; break;
                        case 'Playlists': iconName = focused ? 'musical-notes' : 'musical-notes-outline'; break;
                        case 'Settings': iconName = focused ? 'settings' : 'settings-outline'; break;
                        default: iconName = 'ellipse-outline';
                    }
                    return <Ionicons name={iconName as any} size={22} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen as any} />
            <Tab.Screen name="Favorites" component={FavoritesScreen as any} />
            <Tab.Screen name="Playlists" component={QueueScreen as any} options={{ title: 'Queue' }} />
            <Tab.Screen name="Settings" component={SettingsScreen as any} />
        </Tab.Navigator>
    );
};

const AppNavigator: React.FC = () => {
    const currentSong = usePlayerStore((s) => s.currentSong);
    const { colors, isDark } = useTheme();

    const navTheme = isDark
        ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: colors.bg, card: colors.surface, border: colors.border, primary: colors.accent, text: colors.textPrimary, notification: colors.accent } }
        : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.bg, card: colors.surface, border: colors.border, primary: colors.accent, text: colors.textPrimary, notification: colors.accent } };

    return (
        <NavigationContainer theme={navTheme}>
            <View style={[styles.container, { backgroundColor: colors.bg }]}>
                <Stack.Navigator
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: colors.bg },
                        freezeOnBlur: true, // Optimize memory without causing white flashes
                    }}
                >
                    <Stack.Screen name="Tabs" component={TabNavigator} />
                    <Stack.Screen
                        name="Player"
                        component={PlayerScreen}
                        options={{ animation: 'slide_from_bottom', presentation: 'transparentModal' }}
                    />
                    <Stack.Screen name="Queue" component={QueueScreen} />
                    <Stack.Screen
                        name="Search"
                        component={SearchScreen}
                        options={{ animation: 'fade' }}
                    />
                    <Stack.Screen
                        name="Artist"
                        component={ArtistScreen}
                        options={{ animation: 'slide_from_right' }}
                    />
                    <Stack.Screen
                        name="Album"
                        component={AlbumScreen}
                        options={{ animation: 'slide_from_right' }}
                    />
                </Stack.Navigator>
                {currentSong && <MiniPlayer />}
            </View>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({ container: { flex: 1 } });
export default AppNavigator;
