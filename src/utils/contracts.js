export const HIDDENCARDSCONTRACTADDRESS =
  "0x93746570203133D96055ADAEfA07391AeE1B467d";
  
export const HIDDENCARDSABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "encryptedCards",
    outputs: [
      {
        internalType: "euint8",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCard",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "viewCard",
    outputs: [
      {
        internalType: "euint8",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
