import type { AppDescriptor, GameUmdAsset, PhotoAsset, SoundId, ThemeMode } from '../types';

export const BOOT_DURATION_MS = 3100;

export const APPS: AppDescriptor[] = [
  {
    id: 'settings',
    title: 'Settings',
    icon: '/assets/openxmb/icons/icon_category_settings.png',
    routeKey: 'settings',
    accent: '#f8fbff',
    items: [
      { id: 'settings-system', title: 'System Settings', icon: '/assets/openxmb/item-icons/icon_settings_debug.png' },
      { id: 'settings-theme', title: 'Theme Settings', icon: '/assets/openxmb/item-icons/icon_settings_background-type.png' },
      { id: 'settings-power-save', title: 'Power Save Settings', icon: '/assets/openxmb/item-icons/icon_settings_max-fps.png' },
    ],
  },
  {
    id: 'photo',
    title: 'Photo',
    icon: '/assets/openxmb/icons/icon_category_photo.png',
    routeKey: 'photo',
    accent: '#e8f6ff',
    items: [
      { id: 'photo-memory-stick', title: 'Memory Stick', icon: '/assets/openxmb/item-icons/icon_category_photo.png' },
      { id: 'photo-camera', title: 'Camera', icon: '/assets/openxmb/item-icons/icon_category_photo.png' },
      { id: 'photo-slideshow', title: 'Slideshow', icon: '/assets/openxmb/item-icons/icon_category_tv.png' },
    ],
  },
  {
    id: 'music',
    title: 'Music',
    icon: '/assets/openxmb/icons/icon_category_music.png',
    routeKey: 'music',
    accent: '#f8f3ff',
    items: [
      { id: 'music-memory-stick', title: 'Memory Stick', icon: '/assets/openxmb/item-icons/icon_category_music.png' },
      { id: 'music-playlists', title: 'Playlists', icon: '/assets/openxmb/item-icons/icon_category_music.png' },
      { id: 'music-now-playing', title: 'Now Playing', icon: '/assets/openxmb/item-icons/icon_button_default_right.png' },
    ],
  },
  {
    id: 'video',
    title: 'Video',
    icon: '/assets/openxmb/icons/icon_category_video.png',
    routeKey: 'video',
    accent: '#eef8ff',
    items: [
      { id: 'video-memory-stick', title: 'Memory Stick', icon: '/assets/openxmb/item-icons/icon_category_video.png' },
      { id: 'video-umd', title: 'UMD Video', icon: '/assets/openxmb/item-icons/icon_category_video.png' },
      { id: 'video-saved', title: 'Saved Videos', icon: '/assets/openxmb/item-icons/icon_settings_video.png' },
    ],
  },
  {
    id: 'game',
    title: 'Game',
    icon: '/assets/openxmb/icons/icon_category_game.png',
    routeKey: 'game',
    launchSound: 'startGame',
    accent: '#f3fffa',
    items: [
      { id: 'game-memory-stick', title: 'Memory Stick', icon: '/assets/openxmb/item-icons/icon_category_game.png' },
      { id: 'game-umd', title: 'UMD', icon: '/assets/openxmb/item-icons/icon_category_game.png' },
      { id: 'game-saved-data', title: 'Saved Data Utility', icon: '/assets/openxmb/item-icons/icon_settings_personalization.png' },
    ],
  },
  {
    id: 'network',
    title: 'Network',
    icon: '/assets/openxmb/icons/icon_category_network.png',
    routeKey: 'network',
    accent: '#ebf8ff',
    items: [
      { id: 'network-browser', title: 'Internet Browser', icon: '/assets/openxmb/item-icons/icon_category_network.png' },
      { id: 'network-remote', title: 'Remote Play', icon: '/assets/openxmb/item-icons/icon_settings_controller-type.png' },
      { id: 'network-rss', title: 'RSS Channel', icon: '/assets/openxmb/item-icons/icon_settings_update.png' },
    ],
  },
  {
    id: 'friends',
    title: 'Friends',
    icon: '/assets/openxmb/icons/icon_category_friends.png',
    routeKey: 'friends',
    accent: '#f2f6ff',
    items: [
      { id: 'friends-avatar', title: 'Avatar', icon: '/assets/openxmb/item-icons/icon_category_friends.png' },
      { id: 'friends-messages', title: 'Messages', icon: '/assets/openxmb/item-icons/icon_category_friends.png' },
      { id: 'friends-chat', title: 'Chat Room', icon: '/assets/openxmb/item-icons/icon_category_friends.png' },
    ],
  },
];

export const SOUND_MAP: Record<SoundId, string> = {
  boot: '/assets/sfx/boot.mp3',
  cursor: '/assets/sfx/cursor.mp3',
  confirm: '/assets/sfx/confirm.mp3',
  cancel: '/assets/sfx/cancel.mp3',
  startGame: '/assets/sfx/start-game.mp3',
};

export const PHOTO_LIBRARY: PhotoAsset[] = [
  { id: 'photo-01', title: 'Ocean Horizon', src: '/assets/media/photos/photo-01.png' },
  { id: 'photo-02', title: 'XMB Vista', src: '/assets/media/photos/photo-02.png' },
  { id: 'photo-03', title: 'Photo Category Icon', src: '/assets/media/photos/photo-03.png' },
  { id: 'photo-04', title: 'Music Category Icon', src: '/assets/media/photos/photo-04.png' },
];

export const GAME_UMD_LIBRARY: GameUmdAsset[] = [
  {
    id: 'umd-01',
    title: 'GTA Liberty City Stories',
    subtitle: 'UMD Game',
    cover: '/assets/media/game-art/gta-liberty-city-stories.webp',
  },
  {
    id: 'umd-02',
    title: 'God of War: Ghost of Sparta',
    subtitle: 'UMD Game',
    cover: '/assets/media/game-art/god-of-war-ghost-of-sparta.webp',
  },
  {
    id: 'umd-03',
    title: 'Need for Speed Carbon',
    subtitle: 'UMD Game',
    cover: '/assets/media/game-art/need-for-speed-carbon.jpg',
  },
];

export const INPUT_MAP = {
  navLeft: 'ArrowLeft',
  navRight: 'ArrowRight',
  navUp: 'ArrowUp',
  navDown: 'ArrowDown',
  confirm: 'Enter',
  cancel: 'Escape',
  power: 'p',
};

export const THEME_MODE_ORDER: ThemeMode[] = ['auto', 'night', 'dawn', 'day', 'dusk'];

export const DEFAULT_THEME_MODE: ThemeMode = 'auto';
