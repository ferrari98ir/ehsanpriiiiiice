import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  className?: string; // Applied to wrapper container
  imgClassName?: string; // Applied to img tag
  priority?: boolean; // If true, loads immediately
}

export function LazyImage({ src, alt, className = '', imgClassName = '', priority = false, ...props }: LazyImageProps) {
  const [isInView, setIsInView] = useState(priority);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    // If IntersectionObserver is not supported, load immediately
    if (!('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '800px', // Very aggressive margin so remaining images load quickly in advance
      }
    );

    const currentRef = imgRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [priority]);

  return (
    <div 
      ref={imgRef} 
      className={`relative overflow-hidden flex items-center justify-center ${className}`}
    >
      {/* Animated shimmer placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-l from-slate-100 via-slate-200/50 to-slate-100 animate-pulse" />
      )}
      
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
          onLoad={() => setIsLoaded(true)}
          referrerPolicy="no-referrer"
          loading={priority ? "eager" : "lazy"}
          {...props}
        />
      )}
    </div>
  );
}
