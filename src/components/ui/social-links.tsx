
"use client"

import * as React from "react"
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

interface Social {
  name: string
  icon: React.ReactNode
  href: string
  ariaLabel?: string
}

interface SocialLinksProps extends Omit<HTMLMotionProps<"div">, "variants"> {
  socials: Social[]
  layoutType?: "horizontal" | "grid"
}

export function SocialLinks({ 
  socials, 
  className, 
  layoutType = "horizontal",
  ...props 
}: SocialLinksProps) {
  const [hoveredSocial, setHoveredSocial] = React.useState<string | null>(null)
  
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      } 
    }
  }
  
  const itemVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15
      }
    },
    hover: { 
      y: -5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  }

  return (
    <motion.div
      className={cn(
        layoutType === "horizontal" 
          ? "flex flex-wrap items-center justify-center gap-3 sm:gap-4" 
          : "grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4",
        className
      )}
      initial="initial"
      animate="animate"
      variants={containerVariants}
      {...props}
    >
      {socials.map((social, index) => (
        <motion.a
          key={index}
          href={social.href}
          aria-label={social.ariaLabel || `Visit our ${social.name} page`}
          className={cn(
            "relative transition-colors duration-200 group",
            hoveredSocial && hoveredSocial !== social.name
              ? "opacity-50"
              : "opacity-100",
            layoutType === "grid" 
              ? "flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20" 
              : "flex items-center justify-center"
          )}
          onMouseEnter={() => setHoveredSocial(social.name)}
          onMouseLeave={() => setHoveredSocial(null)}
          variants={itemVariants}
          whileHover="hover"
        >
          <span className={cn(
            "text-brand-gold group-hover:text-white transition-colors duration-300",
            layoutType === "grid" ? "" : "h-5 w-5"
          )}>
            {social.icon}
          </span>
          {layoutType === "grid" && (
            <span className="mt-1 text-xs">{social.name}</span>
          )}
        </motion.a>
      ))}
    </motion.div>
  )
}
