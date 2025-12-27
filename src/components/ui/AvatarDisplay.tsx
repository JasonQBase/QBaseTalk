"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface AvatarDisplayProps {
  src?: string;
  alt?: string;
  size?: number;
  className?: string;
  animate?: boolean;
}

export function AvatarDisplay({
  src = "/placeholder-avatar.png",
  alt = "AI Avatar",
  size = 300,
  className = "",
  animate = false,
}: AvatarDisplayProps) {
  const content = (
    <div
      className={`from-primary/20 to-cyan/20 relative overflow-hidden rounded-3xl bg-linear-to-br ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image src={src} alt={alt} fill className="object-cover" priority />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <div className="from-primary to-cyan h-32 w-32 rounded-full bg-linear-to-br opacity-40" />
        </div>
      )}
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}
