import React from 'react'
import Image from 'next/image'
import SignInFromClient from '@/features/auth/components/signin-from-client'

import { Press_Start_2P } from "next/font/google";


const press_start_2p = Press_Start_2P({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-press-start-2p",
});

const SignInPage = () => {
  return (
    <div className='space-y-6 flex flex-col items-center justify-center'>
        <Image src={"/coding-program-website-computer-technology-svgrepo-com%20(1).svg"} alt="Logo Image" width={255} height={255} />
        <span className={`${press_start_2p.className} flex flex-col justify-center text-6xl text-orange-400`}>CodeEditor_</span>
        <SignInFromClient />
    </div>
  )
}

export default SignInPage
