'use client'
import { useContext, createContext, useState, useEffect, useReducer } from 'react';
import { MyUSDContractAddress, abi } from './MyUSD';
import { MyMusicVerseContractAddress, abi } from './MyMusicVerse';
import { prepareWriteContract, writeContract, readContract, watchContractEvent } from '@wagmi/core'


import {  useAccount, usePublicClient } from 'wagmi';
import { BaseError, ContractFunctionRevertedError } from 'viem';

const ContractContext = createContext();

export const ContractContextProvider = ({ children }) => {

  /**** Initialisation des variables ****/

  const [owner, setOwner] = useState('');
  const viemPublicClient = usePublicClient();
  const [allProp, setAllProp] = useState([]);
  const [allVoters, setAllVoters] = useState([]);
  const [winner, setWinner] = useState('');
  const [isVoter, setIsVoter] = useState(false);
  const {isConnected, address} = useAccount();


  const [state, dispatchFromEventsAction] = useReducer(contractContextReducer, {
    workFlowStatus: 0,
    newProposal: 0,
    votedProposal: 0,
    voterAddress: '',
    hasVotedAddress: '',
  });

    /**** Popup message Toast ****/

  const showToastMessage = (type,message) => {
    if(type =='error'){
      toast.error(message, {
      position: toast.POSITION.BOTTOM_RIGHT,

      });
  } 
  if(type == 'success'){
    toast.success(message, {
      position: toast.POSITION.BOTTOM_RIGHT,

      });
  }

  };



    /**** Ecoute des evenements ****/





  /* Surveillance continue des évènements */

  // Add voter
/*
  useEffect(() => {

    if (state.voterAddress != '') {
 
      const fetchVoter = async () => {
        const voter = await readContract({
          address: contractAddress,
          abi: abi,
          functionName: 'getVoter',
          args: [state.voterAddress]
        });
        setAllVoters([...allVoters, {
          address: state.voterAddress, isRegistered: voter.isRegistered, hasVoted: voter.hasVoted, votedProposalId: Number(voter.votedProposalId)
        }]);

      }
      fetchVoter();
     
    }
  }, [state.voterAddress])

  */

  // Rechercher la propostion qui vient d'être ajoutée.


  /* Requetes de fonctions */

  // Add voter
  const addVoter = async (address) => {
    try {
      const { request } = await prepareWriteContract({
        address: contractAddress,
        abi: abi,
        functionName: 'addVoter',
        args: [address]
      });
      const { hash } = await writeContract(request);
      showToastMessage('success', 'Voter \''+state.voterAddress+'\' added successfully.')

    
    } catch (err) {
      displayError(err);
    }
  }




  /* ----- */

  const value = {  };

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  )
};

export const useContractContext = () => useContext(ContractContext);