import React from "react";

const GraniteBackground: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gray-100">
      {/* Granite simulation layer */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle,_rgba(200,200,200,0.1)_1px,_transparent_1px)] [background-size:10px_10px] mix-blend-multiply" />

      {/* Subtle noise layer */}
      <div className="absolute inset-0 z-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />

      {/* Optional light/dark speckles */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-neutral-200 via-gray-300 to-neutral-400 opacity-60" />

      {/* Content above background */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default GraniteBackground;
