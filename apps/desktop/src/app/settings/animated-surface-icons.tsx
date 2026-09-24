import { motion } from 'motion/react'
import { useEffect, useState } from 'react'

import { ImageIcon, Pause, Play } from '@/lib/icons'

/**
 * A rotating wallpaper icon that spins when the slideshow is active.
 * Honors prefers-reduced-motion: if the user opts out, it stays static.
 */
export function AnimatedWallpaperIcon({ active = true }: { active?: boolean }) {
  const [prefersReduced, setPrefersReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setPrefersReduced(mq.matches)
    update()
    mq.addEventListener?.('change', update)

    return () => mq.removeEventListener?.('change', update)
  }, [])

  return (
    <motion.div
      animate={active && !prefersReduced ? { rotate: 360 } : { rotate: 0 }}
      transition={{
        duration: 20,
        repeat: active && !prefersReduced ? Infinity : 0,
        ease: 'linear'
      }}
    >
      <ImageIcon className="size-4 text-blue-500" />
    </motion.div>
  )
}

/**
 * A pulsing play/pause button for the slideshow toggle.
 * Pulsates when the slideshow is running.
 */
export function AnimatedSlideshowIcon({ running = false }: { running?: boolean }) {
  const [prefersReduced, setPrefersReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReduced(mq.matches)
  }, [])

  return (
    <motion.div
      animate={running && !prefersReduced ? { scale: [1, 1.15, 1] } : { scale: 1 }}
      transition={{
        duration: running && !prefersReduced ? 1.5 : 0.3,
        repeat: running && !prefersReduced ? Infinity : 0
      }}
    >
      {running ? (
        <Pause className="size-4 text-green-500" />
      ) : (
        <Play className="size-4 text-muted-foreground" />
      )}
    </motion.div>
  )
}
