import React from "react";

const GraniteBackground: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gray-100">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle,_rgba(200,200,200,0.1)_1px,_transparent_1px)] [background-size:10px_10px] mix-blend-multiply" />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-neutral-200 via-gray-300 to-neutral-400 opacity-60" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default GraniteBackground;
