import React, { useState } from "react";

interface LoadingImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void; // ✅ allow click
}

export const LoadingImage: React.FC<LoadingImageProps> = ({
  src,
  alt,
  className = "",
  onClick,
}) => {
  const [loading, setLoading] = useState(true);

  return (
    <div className="image-wrapper" onClick={onClick}>
      {loading && <div className="image-spinner" />}

      <img
        src={src}
        alt={alt}
        className={`${className} ${loading ? "hidden" : "visible"}`}
        onLoad={() => setLoading(false)}
        onError={() => setLoading(false)}
      />
    </div>
  );
};
