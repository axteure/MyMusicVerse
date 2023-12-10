'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

// Wagmi
import { usePublicClient } from 'wagmi'
import { prepareWriteContract, writeContract } from '@wagmi/core'

// Contracts informations
import { MyMusicVerseABI, MyMusicVerseContractAddress } from '@/contracts/MyMusicVerse';
import { MyUSDABI , MyUSDContractAddress } from '@/contracts/MyUSD';
import { CrowdfundingABI } from '@/contracts/Crowdfunding';

// Toast
import { toast } from 'react-toastify';

export default function Home({ params }) {

    
  const viemPublicClient = usePublicClient();

  const [campaign, setCampaign] = useState(null);
  const[depositAmount, setDepositAmount] = useState(0);


  const getCampaigns = async () => {
    try {
      const campaignsData = await viemPublicClient.getContractEvents({
        address: MyMusicVerseContractAddress,
        abi: MyMusicVerseABI,
        eventName: 'CampaignCreated',
        fromBlock: 0n,
        toBlock: 'latest',
      });

      var campaign = campaignsData.find(function(campaign) {
        return campaign.args.campaignAddress === params.campaignAddress;
      });

      setCampaign(campaign);

    } catch (error) {
      toast.error("Problem!");
      console.error(error);
    }
  };

  useEffect(() => {
    getCampaigns();
  }, []);


  const Deposit = async () => {

    try {

      const { request } = await prepareWriteContract({
      address: MyUSDContractAddress,
      abi: MyUSDABI,
      functionName: 'approve',
      args: [MyMusicVerseContractAddress,depositAmount],
      })
      const { hash } = await writeContract(request)
      toast.success("Amount deposited!");


      
  } catch (error) {
      toast.error("Problem!");
      console.log(error)
  }

  try {

    const { request } = await prepareWriteContract({
    address: params.campaignAddress,
    abi: CrowdfundingABI,
    functionName: 'deposit',
    args: [depositAmount],
    })
    const { hash } = await writeContract(request)
    toast.success("Amount deposited!");

    
} catch (error) {
    toast.error("Problem!");
    console.log(error)
}


    
}

  return (
    <>

      {campaign ? (
  
      <a className="block max-w-l p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{campaign.args.title}</h5>
        <p className="font-normal text-gray-700 dark:text-gray-400">Campaign address : {campaign.args.campaignAddress}</p>
        <p className="font-normal text-gray-700 dark:text-gray-400">Quantity of tracks : {campaign.args.tracksQuantity}</p>
        <p className="font-normal text-gray-700 dark:text-gray-400">Target : {campaign.args.target} $</p>

        

        <div className="mb-5">
          <label htmlFor="depositAmount" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Amount</label>
          <input type="number" id="depositAmount" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="3000" required value={depositAmount} onChange={(e)=>{setDepositAmount(e.target.value)}}/>
        </div>
        <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={Deposit}>Deposit</button>

      </a>

      ) : (
        <p>Chargement..</p>
      )}


      

    </>
  )
}
