'use client'

import ConnectWallet from '@/components/ConnectWallet'
import { useState } from "react";

// Wagmi
import { useAccount, usePublicClient } from 'wagmi'
import { prepareWriteContract, writeContract, watchContractEvent, getContractEvents } from '@wagmi/core'

// Contracts informations
import { MyMusicVerseABI, MyMusicVerseContractAddress } from '@/contracts/MyMusicVerse';


// Toast
import { toast } from 'react-toastify';


export default function CreateCampaign() {

    //const { address, isConnecting } = useAccount()

    const viemPublicClient = usePublicClient();

    const { isConnected} = useAccount();

    // Input states
    const[title, setTitle] = useState('');
    const[target, setTarget] = useState('');
    const[tracksQuantity, setTracksQuantity] = useState('');



    // CreateCampaign function
    const CreateCampaign = async () => {
        try {

            const { request } = await prepareWriteContract({
            address: MyMusicVerseContractAddress,
            abi: MyMusicVerseABI,
            functionName: 'createCampaign',
            args: [target, title, tracksQuantity],
            })
            const { hash } = await writeContract(request)
            toast("Wow so easy!");

            
        } catch (error) {
            toast("Problem!");
            console.log(err)
        }
    }




    

  return (
    <>

{isConnected ? (

    <div>
      
    <div className="mb-6">
        <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Title of the album</label>
        <input type="text" id="title" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Me new album" required value={title} onChange={(e)=>{setTitle(e.target.value)}}/>
    </div>
    <div className="grid gap-6 mb-6 md:grid-cols-2">
        <div>
            <label htmlFor="target" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Target of the campaign</label>
            <input type="number" id="target" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="3000" required  value={target} onChange={(e)=>{setTarget(e.target.value)}}/>
        </div>
        <div>
            <label htmlFor="tracksQuantity" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Quantity of tracks</label>
            <input type="number" id="tracksQuantity" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="5" required  value={tracksQuantity} onChange={(e)=>{setTracksQuantity(e.target.value)}}/>
        </div>
    </div>

    
    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="file_input">Upload file</label>
    <input className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" aria-describedby="file_input_help" id="file_input" type="file" />
    <p className="mt-1 text-sm text-gray-500 dark:text-gray-300" id="file_input_help">SVG, PNG, JPG or GIF (MAX. 800x400px).</p>

    <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 mt-3 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={CreateCampaign}>Create a new campaign</button>

</ div>
) : (

<ConnectWallet />

)}


    </>
  )
}