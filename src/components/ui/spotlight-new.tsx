"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const Spotlight = ({
  gradientFirst = "radial-gradient(20% 100% at 50% 0%, hsla(142, 76%, 50%, 0.15) 0%, hsla(142, 76%, 30%, 0.08) 50%, hsla(142, 76%, 20%, 0) 100%)",
  gradientSecond = "radial-gradient(15% 100% at 50% 0%, hsla(240, 4.8%, 70%, 0.1) 0%, hsla(240, 4.8%, 50%, 0.05) 80%, transparent 100%)",
  gradientThird = "radial-gradient(15% 100% at 50% 0%, hsla(27, 87%, 60%, 0.08) 0%, hsla(27, 87%, 40%, 0.04) 80%, transparent 100%)",
  duration = 6,
  xOffset = 100,
} = {}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const width = isMobile ? 280 : 500;
  const height = isMobile ? 700 : 1200;
  const smallWidth = isMobile ? 100 : 150;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden"
    >
      {[1, -1].map((direction) => (
        <motion.div
          key={direction}
          animate={{
            x: [0, direction * xOffset, 0],
            rotate: [0, direction * 5, 0],
          }}
          transition={{
            duration,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          className="absolute inset-0 w-full h-full z-40 pointer-events-none origin-top"
        >
          <motion.div
            style={{
              background: gradientFirst,
              width,
              height,
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.8, 0],
              scaleX: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />

          <motion.div
            style={{
              background: gradientSecond,
              width: smallWidth,
              height,
              position: "absolute",
              top: 0,
              left: `calc(50% + ${direction * 100}px)`,
              transform: "translateX(-50%)",
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.6, 0],
              scaleX: [0.9, 1.1, 0.9],
            }}
            transition={{
              duration: duration * 0.8,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
              delay: 0.3,
            }}
          />

          <motion.div
            style={{
              background: gradientThird,
              width: smallWidth,
              height,
              position: "absolute",
              top: 0,
              left: `calc(50% + ${direction * 200}px)`,
              transform: "translateX(-50%)",
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.4, 0],
              scaleX: [0.9, 1.1, 0.9],
            }}
            transition={{
              duration: duration * 0.9,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
              delay: 0.6,
            }}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default Spotlight;
