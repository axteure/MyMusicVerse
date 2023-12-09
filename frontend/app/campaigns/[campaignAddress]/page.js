'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'


import ConnectWallet from '@/components/ConnectWallet'

// Wagmi
import { useAccount, usePublicClient } from 'wagmi'
import { prepareWriteContract, writeContract, watchContractEvent, getContractEvents } from '@wagmi/core'

// Contracts informations
import { MyMusicVerseABI, MyMusicVerseContractAddress } from '@/contracts/MyMusicVerse';
import { reactStrictMode } from '@/next.config';


export default function Home({ params }) {

  return (
    <>

    Crowdfunding address : {params.campaignAddress}
      

    </>
  )
}
