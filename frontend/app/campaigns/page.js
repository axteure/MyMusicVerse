'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import Link from 'next/link'


import ConnectWallet from '@/components/ConnectWallet'

// Wagmi
import { useAccount, usePublicClient } from 'wagmi'
import { prepareWriteContract, writeContract, watchContractEvent, getContractEvents } from '@wagmi/core'

// Contracts informations
import { MyMusicVerseABI, MyMusicVerseContractAddress } from '@/contracts/MyMusicVerse';
import { reactStrictMode } from '@/next.config';

import { toast } from 'react-toastify';


export default function Home() {

  
  const viemPublicClient = usePublicClient();

  const [campaigns, setCampaigns] = useState([]);




  const getCampaigns = async () => {
    try {
      const campaignsData = await viemPublicClient.getContractEvents({
        address: MyMusicVerseContractAddress,
        abi: MyMusicVerseABI,
        eventName: 'CampaignCreated',
        fromBlock: 0n,
        toBlock: 'latest',
      });

      console.log(campaignsData);
      setCampaigns(campaignsData);
    } catch (error) {
      toast.error("Problem!");
      console.error(error);
    }
  };

  useEffect(() => {
    getCampaigns();
  }, []);


  return (
    <>

      <Link href='/campaigns/create'><button type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Create Campaign</button></Link>


      <div className="grid grid-cols-4 gap-4">

      { campaigns.map((campaign, index) => (


        <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
          <a href="#">
          <Image
                src="/album.jpg"
                width={180}
                height={37}
                alt="album"
              />
          </a>
          <div className="p-5">
              <a href="#">
                  <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{campaign.args.title} ({campaign.args.target}$)</h5>
              </a>
              <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus mollitia quisquam officia reiciendis laudantium cum perspiciatis.</p>
              <Link href={`/campaigns/${encodeURIComponent(campaign.args.campaignAddress)}`} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                  Read more
                  <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                  </svg>
              </Link>
          </div>
        </div>

      ))}



      </div>

      

    </>
  )
}
