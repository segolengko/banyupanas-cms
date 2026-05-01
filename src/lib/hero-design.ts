import type {
  ButtonStyle,
  HeroLayoutStyle,
  HeroMood,
  SurfaceStyle,
  TrustChipStyle,
} from '@/types';

export const heroLayoutOptions: Array<{
  value: HeroLayoutStyle;
  label: string;
  description: string;
}> = [
  {
    value: 'immersive',
    label: 'Immersive',
    description: 'Hero lebar dan langsung fokus ke headline dengan ritme yang paling dramatis.',
  },
  {
    value: 'split',
    label: 'Split Focus',
    description: 'Headline dan metric berbagi ruang, cocok jika data tiket dan positioning ingin terlihat cepat.',
  },
  {
    value: 'editorial',
    label: 'Editorial',
    description: 'Lebih tenang dan simetris, cocok untuk tone brand yang terasa rapi dan premium.',
  },
];

export const trustChipStyleOptions: Array<{
  value: TrustChipStyle;
  label: string;
  description: string;
}> = [
  {
    value: 'soft',
    label: 'Soft Glass',
    description: 'Chip transparan lembut yang tetap terasa ringan di atas background visual.',
  },
  {
    value: 'outline',
    label: 'Outline',
    description: 'Lebih tipis dan bersih, cocok kalau headline ingin jadi fokus utama.',
  },
  {
    value: 'solid',
    label: 'Solid',
    description: 'Lebih tegas dan kontras, cocok untuk trust signal yang ingin lebih cepat terlihat.',
  },
];

export const heroMoodOptions: Array<{
  value: HeroMood;
  label: string;
  description: string;
}> = [
  {
    value: 'calm',
    label: 'Calm',
    description: 'Overlay tetap lembut dan tenang, cocok untuk kesan wellness yang santai.',
  },
  {
    value: 'dramatic',
    label: 'Dramatic',
    description: 'Kontras lebih kuat dan lebih dalam, cocok untuk opening yang lebih sinematik.',
  },
  {
    value: 'bright',
    label: 'Bright',
    description: 'Lebih ringan dan terbuka, cocok kalau poster atau video ingin lebih terlihat.',
  },
];

export const buttonStyleOptions: Array<{
  value: ButtonStyle;
  label: string;
  description: string;
}> = [
  {
    value: 'pill',
    label: 'Pill',
    description: 'Paling lembut dan friendly, cocok untuk tone resort yang santai.',
  },
  {
    value: 'soft-corner',
    label: 'Soft Corner',
    description: 'Lebih modern dan rapi, cocok untuk nuansa CMS publik yang terasa polished.',
  },
  {
    value: 'crisp',
    label: 'Crisp',
    description: 'Lebih tegas dan editorial, cocok jika CTA ingin terasa lebih langsung.',
  },
];

export const surfaceStyleOptions: Array<{
  value: SurfaceStyle;
  label: string;
  description: string;
}> = [
  {
    value: 'soft',
    label: 'Soft Surface',
    description: 'Panel tetap lembut dan hangat, paling dekat dengan tampilan awal saat ini.',
  },
  {
    value: 'glass',
    label: 'Glass Surface',
    description: 'Panel lebih glossy dan berlapis, cocok untuk kesan modern yang lebih premium.',
  },
  {
    value: 'outlined',
    label: 'Outlined Surface',
    description: 'Panel lebih ringan dan minimal, cocok jika konten ingin terasa lebih editorial.',
  },
];

export function normalizeHeroLayoutStyle(input: unknown): HeroLayoutStyle {
  switch (String(input || '').trim()) {
    case 'split':
    case 'editorial':
      return String(input) as HeroLayoutStyle;
    default:
      return 'immersive';
  }
}

export function normalizeTrustChipStyle(input: unknown): TrustChipStyle {
  switch (String(input || '').trim()) {
    case 'outline':
    case 'solid':
      return String(input) as TrustChipStyle;
    default:
      return 'soft';
  }
}

export function normalizeHeroMood(input: unknown): HeroMood {
  switch (String(input || '').trim()) {
    case 'dramatic':
    case 'bright':
      return String(input) as HeroMood;
    default:
      return 'calm';
  }
}

export function normalizeButtonStyle(input: unknown): ButtonStyle {
  switch (String(input || '').trim()) {
    case 'soft-corner':
    case 'crisp':
      return String(input) as ButtonStyle;
    default:
      return 'pill';
  }
}

export function normalizeSurfaceStyle(input: unknown): SurfaceStyle {
  switch (String(input || '').trim()) {
    case 'glass':
    case 'outlined':
      return String(input) as SurfaceStyle;
    default:
      return 'soft';
  }
}

export function getHeroLayoutClasses(style: HeroLayoutStyle) {
  switch (style) {
    case 'split':
      return {
        shell: 'xl:grid xl:grid-cols-[minmax(0,0.88fr)_minmax(300px,0.72fr)] xl:items-end xl:gap-10 xl:space-y-0',
        content: 'space-y-8',
        heading: 'max-w-3xl text-[2.05rem] leading-[1.02] sm:text-[2.35rem] md:text-[3.4rem] xl:text-[3.85rem]',
        description: 'max-w-xl',
        actions: 'sm:flex-row',
        chips: 'justify-start',
        metrics: 'md:grid-cols-2 xl:max-w-none xl:grid-cols-2 xl:pt-0',
      };
    case 'editorial':
      return {
        shell: 'mx-auto max-w-5xl text-center',
        content: 'mx-auto flex max-w-4xl flex-col items-center space-y-8',
        heading: 'mx-auto max-w-4xl text-[2rem] leading-[1.03] sm:text-[2.25rem] md:text-[3.3rem] xl:text-[3.9rem]',
        description: 'mx-auto max-w-2xl',
        actions: 'sm:flex-row sm:justify-center',
        chips: 'justify-center',
        metrics: 'mx-auto w-full max-w-4xl md:grid-cols-2 xl:max-w-4xl xl:grid-cols-4',
      };
    default:
      return {
        shell: 'space-y-8',
        content: 'space-y-8',
        heading: 'max-w-4xl text-[2.05rem] leading-[1.02] sm:text-[2.35rem] md:text-[3.65rem] xl:text-[4.05rem]',
        description: 'max-w-2xl',
        actions: 'sm:flex-row',
        chips: 'justify-start',
        metrics: 'md:grid-cols-2 xl:max-w-[920px] xl:grid-cols-4',
      };
  }
}

export function getTrustChipClassName(style: TrustChipStyle) {
  switch (style) {
    case 'outline':
      return 'border-white/22 bg-transparent text-white/84';
    case 'solid':
      return 'border-white/0 bg-white text-ink-950';
    default:
      return 'border-white/14 bg-white/8 text-white/74 backdrop-blur';
  }
}

export function getHeroMoodOverlayClassName(style: HeroMood) {
  switch (style) {
    case 'dramatic':
      return 'bg-[linear-gradient(180deg,rgba(8,16,18,0.08)_0%,rgba(8,16,18,0.3)_100%)]';
    case 'bright':
      return 'bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(8,16,18,0.0)_34%,rgba(8,16,18,0.08)_100%)]';
    default:
      return '';
  }
}

export function getButtonShapeClassName(style: ButtonStyle) {
  switch (style) {
    case 'soft-corner':
      return 'rounded-[22px]';
    case 'crisp':
      return 'rounded-[14px]';
    default:
      return 'rounded-full';
  }
}

export function getLightSurfaceClassName(style: SurfaceStyle) {
  switch (style) {
    case 'glass':
      return 'border-white/68 bg-white/70 shadow-[0_24px_80px_rgba(16,33,38,0.1)] backdrop-blur-xl';
    case 'outlined':
      return 'border-ink-950/12 bg-white/64 shadow-none';
    default:
      return 'border-white/55 bg-white/82 shadow-[0_20px_60px_rgba(16,33,38,0.08)] backdrop-blur';
  }
}

export function getDarkSurfaceClassName(style: SurfaceStyle) {
  switch (style) {
    case 'glass':
      return 'border-white/18 bg-white/14 shadow-[0_24px_60px_rgba(0,0,0,0.16)] backdrop-blur-2xl';
    case 'outlined':
      return 'border-white/20 bg-transparent shadow-none';
    default:
      return 'border-white/12 bg-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.14)] backdrop-blur-xl';
  }
}
