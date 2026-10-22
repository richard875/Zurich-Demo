export interface PhotoSource {
  src: string;
  width: number;
  height: number;
  alt: string;
}

// Width and height reserve the space so nothing shifts as photos load. Only the hero loads eagerly.
export function Photo({
  photo,
  eager = false,
  className,
}: {
  photo: PhotoSource;
  eager?: boolean;
  className?: string;
}) {
  return (
    <img
      src={photo.src}
      width={photo.width}
      height={photo.height}
      alt={photo.alt}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      decoding="async"
      className={className}
    />
  );
}
