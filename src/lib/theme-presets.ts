import type { ThemePreset } from '@/types';

export const themePresetOptions: Array<{
  value: ThemePreset;
  label: string;
  description: string;
  swatches: string[];
}> = [
  {
    value: 'oasis',
    label: 'Oasis Mineral',
    description: 'Seimbang, hangat, dan paling dekat dengan identitas premium yang sekarang.',
    swatches: ['#17323a', '#1f8a80', '#d5925d', '#f8f4ec'],
  },
  {
    value: 'mineral',
    label: 'Mineral Blue',
    description: 'Lebih crisp, bersih, dan terasa modern untuk tema destinasi yang lebih tenang.',
    swatches: ['#183344', '#3a7ca5', '#f0a35c', '#f2f5f7'],
  },
  {
    value: 'forest',
    label: 'Forest Spring',
    description: 'Lebih natural dan earthy, cocok kalau ingin rasa alamnya lebih kuat.',
    swatches: ['#1f3a2d', '#3f7d4e', '#c89b5e', '#f4f3eb'],
  },
  {
    value: 'sunset',
    label: 'Sunset Amber',
    description: 'Lebih hangat dan berani, cocok untuk landing page yang ingin terasa hidup.',
    swatches: ['#4a2a27', '#c95c37', '#efb15f', '#fcf2ea'],
  },
];
