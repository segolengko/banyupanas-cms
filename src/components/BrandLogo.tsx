import Image from 'next/image';
import { cn } from '@/lib/utils';

function LogoFrame({
  src,
  alt,
  className,
  sizes,
  priority = false,
}: {
  src: string;
  alt: string;
  className: string;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <div className={cn('relative shrink-0', className)}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-contain" />
    </div>
  );
}

export function BrandMark({
  alt = 'Banyu Panas mark',
  className,
  priority = false,
}: {
  alt?: string;
  className: string;
  priority?: boolean;
}) {
  return (
    <LogoFrame
      src="/brand/logo-mark-transparent.png"
      alt={alt}
      className={className}
      sizes="(max-width: 768px) 48px, 64px"
      priority={priority}
    />
  );
}

export function BrandLockup({
  alt = 'Banyu Panas logo',
  className,
  priority = false,
}: {
  alt?: string;
  className: string;
  priority?: boolean;
}) {
  return (
    <LogoFrame
      src="/brand/logo-lockup-transparent.png"
      alt={alt}
      className={className}
      sizes="(max-width: 768px) 220px, 320px"
      priority={priority}
    />
  );
}
