'use client';

import { useEffect, useRef } from 'react';

export default function HeroBackgroundVideo({
  src,
  poster,
}: {
  src: string;
  poster: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const attemptPlay = () => {
      void video.play().catch(() => {
        // Browser autoplay policies can still block playback; the poster image remains visible underneath.
      });
    };

    if (video.readyState >= 2) {
      attemptPlay();
      return;
    }

    video.addEventListener('loadeddata', attemptPlay, { once: true });

    return () => {
      video.removeEventListener('loadeddata', attemptPlay);
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 h-full w-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster={poster}
      aria-hidden="true"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
