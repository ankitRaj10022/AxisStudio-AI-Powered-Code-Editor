import { AxisMotionGraphics } from '@/components/motion/axis-motion-graphics'
import React from 'react'

const AuthLayout = ({children}:{children:React.ReactNode}) => {
  return (
    <main className='axis-shell axis-grid flex min-h-screen items-center justify-center overflow-hidden px-4 py-10'>
        <AxisMotionGraphics variant="auth" className="absolute inset-0" />
        <div className="axis-spotlight left-[-8rem] top-[10%] h-72 w-72 bg-rose-500/30" />
        <div className="axis-spotlight bottom-[-5rem] right-[8%] h-80 w-80 bg-orange-300/30" />
        {children}
    </main>
  )
}

export default AuthLayout
