export const MyMusicVerseABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_myUSDAddress",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "campaignAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint32",
        "name": "target",
        "type": "uint32"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "tracksQuantity",
        "type": "uint8"
      }
    ],
    "name": "CampaignCreated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "artistCampaigns",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint32",
        "name": "_target",
        "type": "uint32"
      },
      {
        "internalType": "string",
        "name": "_title",
        "type": "string"
      },
      {
        "internalType": "uint8",
        "name": "_tracksQuantity",
        "type": "uint8"
      }
    ],
    "name": "createCampaign",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "artistAddress",
        "type": "address"
      }
    ],
    "name": "getArtistCampaigns",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

export const MyMusicVerseContractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
//export const MyMusicVerseContractAddress = "0x6c6E9C979741d25e6353Dc4057EB5D7978E05AB7"