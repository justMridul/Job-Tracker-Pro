import React from 'react';
import { motion } from 'framer-motion';

// Define elite animation variants inspired by top tech products
const variants = {
  initial: {
    opacity: 0,
    y: 40,
    scale: 0.98,
    filter: "blur(10px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
      scale: { type: 'spring', stiffness: 120, damping: 18 },
    },
  },
  exit: {
    opacity: 0,
    y: -30,
    scale: 0.97,
    filter: "blur(12px)",
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
};

const AnimatedPage = ({ children }) => (
  <motion.div
    variants={variants}
    initial="initial"
    animate="animate"
    exit="exit"
    style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}
  >
    {children}
  </motion.div>
);

export default AnimatedPage;
