'use client';

import { Building2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { cn } from '@/lib/utils';

interface ApartmentGalleryProps {
  imageUrls: string[];
  unitName: string;
}

export function ApartmentGallery({ imageUrls, unitName }: ApartmentGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (imageUrls.length === 0) {
    return (
      <div
        data-testid="apartment-gallery-empty"
        className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-lg bg-muted text-muted-foreground"
      >
        <Building2 aria-hidden="true" className="size-12" strokeWidth={1.5} />
        <p className="text-sm">No photos available for this apartment.</p>
      </div>
    );
  }

  const activeIndex = Math.min(selectedIndex, imageUrls.length - 1);
  const selectedUrl = imageUrls[activeIndex];

  if (selectedUrl === undefined) {
    return null;
  }

  const hasThumbnails = imageUrls.length > 1;

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
        <Image
          src={selectedUrl}
          alt={`${unitName} photo ${activeIndex + 1} of ${imageUrls.length}`}
          fill
          priority={selectedIndex === 0}
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover"
        />
      </div>

      {hasThumbnails ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {imageUrls.map((url, index) => {
            const isSelected = index === selectedIndex;

            return (
              <button
                key={`${url}-${index}`}
                type="button"
                aria-label={`Show photo ${index + 1} of ${imageUrls.length}`}
                aria-pressed={isSelected}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  'relative size-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none sm:size-20',
                  isSelected ? 'border-primary' : 'border-transparent',
                )}
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
