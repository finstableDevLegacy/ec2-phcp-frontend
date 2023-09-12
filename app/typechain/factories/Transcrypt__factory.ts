/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { Transcrypt, TranscryptInterface } from "../Transcrypt";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_router",
        type: "address",
      },
      {
        internalType: "address",
        name: "_rootAdmin",
        type: "address",
      },
      {
        internalType: "address",
        name: "_feeClaimer",
        type: "address",
      },
      {
        internalType: "address",
        name: "_dealerContract",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "isAdmin",
        type: "uint256",
      },
    ],
    name: "AdminUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "oldDealerContract",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "newDealerContract",
        type: "address",
      },
    ],
    name: "DealerContractChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "oldFee",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newFee",
        type: "uint256",
      },
    ],
    name: "FeeChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "oldFeeClaimer",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newFeeClaimer",
        type: "address",
      },
    ],
    name: "FeeClaimerChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "beneficiary",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "FeeCollected",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "orderId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "payer",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "merchant",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "inputToken",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "outputToken",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountOut",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "fee",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "dealer",
        type: "address",
      },
    ],
    name: "Purchased",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "oldRoot",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newRoot",
        type: "address",
      },
    ],
    name: "RootAdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "oldSwapRouter",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "newSwapRouter",
        type: "address",
      },
    ],
    name: "SwapRouterChanged",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_admin",
        type: "address",
      },
    ],
    name: "addAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_newRootAdmin",
        type: "address",
      },
    ],
    name: "changeRootAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "beneficiary",
        type: "address",
      },
    ],
    name: "collectFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "dealerContract",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "fee",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "feeClaimer",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "feeDecimals",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "isAdmin",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "orderStatus",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "orderId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "merchant",
        type: "address",
      },
      {
        internalType: "address[]",
        name: "tokens",
        type: "address[]",
      },
      {
        internalType: "uint256",
        name: "amountInMax",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amountOut",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "dealer",
        type: "address",
      },
    ],
    name: "purchase",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_admin",
        type: "address",
      },
    ],
    name: "removeAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "rootAdmin",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newDealerContract",
        type: "address",
      },
    ],
    name: "setDealerContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "newFee",
        type: "uint256",
      },
    ],
    name: "setFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newFeeClaimer",
        type: "address",
      },
    ],
    name: "setFeeClaimer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newSwapRouter",
        type: "address",
      },
    ],
    name: "setSwapRouter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "shifter",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "swapRouter",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "tokenFeeReserves",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x608060405260326002553480156200001657600080fd5b5060405162001657380380620016578339810160408190526200003991620000ac565b600080546001600160a01b03199081166001600160a01b03958616179091556003805482169385169390931790925560068054831694841694909417909355600780549091169290911691909117905562000109565b80516001600160a01b0381168114620000a757600080fd5b919050565b60008060008060808587031215620000c357600080fd5b620000ce856200008f565b9350620000de602086016200008f565b9250620000ee604086016200008f565b9150620000fe606086016200008f565b905092959194509250565b61153e80620001196000396000f3fe608060405234801561001057600080fd5b50600436106101515760003560e01c806370480275116100cd578063c31c9c0711610081578063cc0f178611610066578063cc0f1786146102cf578063ddca3f43146102d7578063eb78b435146102e057600080fd5b8063c31c9c07146102a9578063c3accd48146102bc57600080fd5b80637803d32d116100b25780637803d32d1461026357806381cbd3ea14610276578063bff494501461028957600080fd5b80637048027514610248578063707ed02b1461025b57600080fd5b80634469e4781161012457806358d642e81161010957806358d642e81461020f57806366eb463f1461022257806369fe0e2d1461023557600080fd5b80634469e478146101c4578063463850cd146101e457600080fd5b80631785f53c14610156578063186224191461016b57806324d7806c1461017e57806341273657146101b1575b600080fd5b61016961016436600461108f565b6102f3565b005b61016961017936600461111c565b61038f565b61019e61018c36600461108f565b60016020526000908152604090205481565b6040519081526020015b60405180910390f35b6101696101bf36600461108f565b61085a565b61019e6101d236600461108f565b60046020526000908152604090205481565b6007546101f7906001600160a01b031681565b6040516001600160a01b0390911681526020016101a8565b6000546101f7906001600160a01b031681565b61016961023036600461108f565b610918565b610169610243366004611201565b6109c4565b61016961025636600461108f565b610a1f565b61019e610ab6565b61016961027136600461108f565b610ac5565b6003546101f7906001600160a01b031681565b61019e610297366004611201565b60056020526000908152604090205481565b6006546101f7906001600160a01b031681565b6101696102ca36600461108f565b610b7b565b61019e600481565b61019e60025481565b6101696102ee36600461121a565b610bd3565b6000546001600160a01b031633146103475760405162461bcd60e51b815260206004820152601260248201527136bab9ba103132903937b7ba1030b236b4b760711b60448201526064015b60405180910390fd5b6001600160a01b038116600081815260016020526040808220829055519091907fabfafa62f2f183eb8fe4ae2293ed2d954001a6a345c459031f171dedad91824e908390a350565b600087815260056020526040902054156103eb5760405162461bcd60e51b815260206004820152601360248201527f4f726465722077617320636f6d706c6574656400000000000000000000000000604482015260640161033e565b6000808651600214801561044457508660018151811061040d5761040d611256565b60200260200101516001600160a01b03168760008151811061043157610431611256565b60200260200101516001600160a01b0316145b1561050e578660008151811061045c5761045c611256565b60209081029190910101516040516323b872dd60e01b8152336004820152306024820152604481018790526001600160a01b03909116906323b872dd906064016020604051808303816000875af11580156104bb573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104df919061126c565b50610504876000815181106104f6576104f6611256565b602002602001015186610d67565b9092509050610556565b600061051d8887893089610dda565b905061054f8860018a5161053191906112a4565b8151811061054157610541611256565b602002602001015182610d67565b9093509150505b6001600160a01b03831661060857866001885161057391906112a4565b8151811061058357610583611256565b602090810291909101015160405163a9059cbb60e01b81526001600160a01b038a81166004830152602482018590529091169063a9059cbb906044016020604051808303816000875af11580156105de573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610602919061126c565b50610779565b866001885161061791906112a4565b8151811061062757610627611256565b602090810291909101015160075460405163095ea7b360e01b81526001600160a01b0391821660048201526024810185905291169063095ea7b3906044016020604051808303816000875af1158015610684573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106a8919061126c565b5060075487516001600160a01b039091169063d9a4060e9089906106ce906001906112a4565b815181106106de576106de611256565b60209081029190910101516040517fffffffff0000000000000000000000000000000000000000000000000000000060e084901b1681526001600160a01b03918216600482015260248101869052600160448201528187166064820152908b16608482015260a401600060405180830381600087803b15801561076057600080fd5b505af1158015610774573d6000803e3d6000fd5b505050505b60008981526005602052604090206001908190558751889161079a916112a4565b815181106107aa576107aa611256565b60200260200101516001600160a01b0316886001600160a01b0316336001600160a01b03167fa84f61640ea6c69221cc64d2c4f6879f1cbfb8ca1a7fd90305b073db64811c2b8c8b60008151811061080457610804611256565b602090810291909101810151604080519384526001600160a01b03918216928401929092529082018c90526060820188905260808201879052881660a082015260c00160405180910390a4505050505050505050565b6000546001600160a01b031633146108a95760405162461bcd60e51b815260206004820152601260248201527136bab9ba103132903937b7ba1030b236b4b760711b604482015260640161033e565b600680546001600160a01b0383811673ffffffffffffffffffffffffffffffffffffffff1983168117909355604080519190921680825260208201939093527f5c5b0bb5085481c320dc523e3b3f829eaa807936f615add0077fa213f345090e91015b60405180910390a15050565b6000546001600160a01b031633146109675760405162461bcd60e51b815260206004820152601260248201527136bab9ba103132903937b7ba1030b236b4b760711b604482015260640161033e565b600080546001600160a01b0383811673ffffffffffffffffffffffffffffffffffffffff19831681178455604051919092169283917fb87f74f9bf2ee13b23c1f12b079998e1a4468f43938c42aa57503cf768a017f99190a35050565b6000546001600160a01b03163314610a135760405162461bcd60e51b815260206004820152601260248201527136bab9ba103132903937b7ba1030b236b4b760711b604482015260640161033e565b610a1c81610fd6565b50565b6000546001600160a01b03163314610a6e5760405162461bcd60e51b815260206004820152601260248201527136bab9ba103132903937b7ba1030b236b4b760711b604482015260640161033e565b6001600160a01b0381166000818152600160208190526040808320829055519092917fabfafa62f2f183eb8fe4ae2293ed2d954001a6a345c459031f171dedad91824e91a350565b610ac26004600a6113a1565b81565b6000546001600160a01b03163314610b145760405162461bcd60e51b815260206004820152601260248201527136bab9ba103132903937b7ba1030b236b4b760711b604482015260640161033e565b600780546001600160a01b0383811673ffffffffffffffffffffffffffffffffffffffff1983168117909355604080519190921680825260208201939093527f121496dd72eb866b4a97fc078bb9891d23af5e600cb74272606db7bd65230f95910161090c565b6000546001600160a01b03163314610bca5760405162461bcd60e51b815260206004820152601260248201527136bab9ba103132903937b7ba1030b236b4b760711b604482015260640161033e565b610a1c81611014565b6003546001600160a01b03163314610c2d5760405162461bcd60e51b815260206004820152601060248201527f4f6e6c792066656520636c61696d657200000000000000000000000000000000604482015260640161033e565b6001600160a01b038316600090815260046020526040812054831015610c535782610c6d565b6001600160a01b0384166000908152600460205260409020545b60405163a9059cbb60e01b81526001600160a01b038481166004830152602482018390529192509085169063a9059cbb906044016020604051808303816000875af1158015610cc0573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ce4919061126c565b506001600160a01b03841660009081526004602052604081208054839290610d0d9084906112a4565b92505081905550836001600160a01b0316826001600160a01b03167ff228de527fc1b9843baac03b9a04565473a263375950e63435d4138464386f4683604051610d5991815260200190565b60405180910390a350505050565b60008080610d776004600a6113a1565b600254610d8490866113ad565b610d8e91906113cc565b90506000610d9c82866112a4565b6001600160a01b038716600090815260046020526040812080549293508492909190610dc99084906113ee565b909155509096919550909350505050565b600085600081518110610def57610def611256565b60209081029190910101516040516323b872dd60e01b8152336004820152306024820152604481018690526001600160a01b03909116906323b872dd906064016020604051808303816000875af1158015610e4e573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e72919061126c565b5085600081518110610e8657610e86611256565b602090810291909101015160065460405163095ea7b360e01b81526001600160a01b0391821660048201526024810187905291169063095ea7b3906044016020604051808303816000875af1158015610ee3573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610f07919061126c565b506006546040517f8803dbee0000000000000000000000000000000000000000000000000000000081526000916001600160a01b031690638803dbee90610f5a90899089908c908a908a90600401611406565b6000604051808303816000875af1158015610f79573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610fa19190810190611477565b90508060018251610fb291906112a4565b81518110610fc257610fc2611256565b602002602001015191505095945050505050565b600280549082905560408051828152602081018490527f5fc463da23c1b063e66f9e352006a7fbe8db7223c455dc429e881a2dfe2f94f1910161090c565b600380546001600160a01b0383811673ffffffffffffffffffffffffffffffffffffffff19831681179093556040519116919082907fb871b6066dbe6c91d3bbe96830eb798921cfa2ab491f35192e05b9c024e436a290600090a35050565b80356001600160a01b038116811461108a57600080fd5b919050565b6000602082840312156110a157600080fd5b6110aa82611073565b9392505050565b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f1916810167ffffffffffffffff811182821017156110f0576110f06110b1565b604052919050565b600067ffffffffffffffff821115611112576111126110b1565b5060051b60200190565b600080600080600080600060e0888a03121561113757600080fd5b873596506020611148818a01611073565b9650604089013567ffffffffffffffff81111561116457600080fd5b8901601f81018b1361117557600080fd5b8035611188611183826110f8565b6110c7565b81815260059190911b8201830190838101908d8311156111a757600080fd5b928401925b828410156111cc576111bd84611073565b825292840192908401906111ac565b985050505060608901359450506080880135925060a088013591506111f360c08901611073565b905092959891949750929550565b60006020828403121561121357600080fd5b5035919050565b60008060006060848603121561122f57600080fd5b61123884611073565b92506020840135915061124d60408501611073565b90509250925092565b634e487b7160e01b600052603260045260246000fd5b60006020828403121561127e57600080fd5b815180151581146110aa57600080fd5b634e487b7160e01b600052601160045260246000fd5b6000828210156112b6576112b661128e565b500390565b600181815b808511156112f65781600019048211156112dc576112dc61128e565b808516156112e957918102915b93841c93908002906112c0565b509250929050565b60008261130d5750600161139b565b8161131a5750600061139b565b8160018114611330576002811461133a57611356565b600191505061139b565b60ff84111561134b5761134b61128e565b50506001821b61139b565b5060208310610133831016604e8410600b8410161715611379575081810a61139b565b61138383836112bb565b80600019048211156113975761139761128e565b0290505b92915050565b60006110aa83836112fe565b60008160001904831182151516156113c7576113c761128e565b500290565b6000826113e957634e487b7160e01b600052601260045260246000fd5b500490565b600082198211156114015761140161128e565b500190565b600060a082018783526020878185015260a0604085015281875180845260c086019150828901935060005b818110156114565784516001600160a01b031683529383019391830191600101611431565b50506001600160a01b03969096166060850152505050608001529392505050565b6000602080838503121561148a57600080fd5b825167ffffffffffffffff8111156114a157600080fd5b8301601f810185136114b257600080fd5b80516114c0611183826110f8565b81815260059190911b820183019083810190878311156114df57600080fd5b928401925b828410156114fd578351825292840192908401906114e4565b97965050505050505056fea26469706673582212205f9769f76c1aed5108af111f99bd82652f0d68a5142bc7012f042f8efc26c86964736f6c634300080b0033";

export class Transcrypt__factory extends ContractFactory {
  constructor(
    ...args: [signer: Signer] | ConstructorParameters<typeof ContractFactory>
  ) {
    if (args.length === 1) {
      super(_abi, _bytecode, args[0]);
    } else {
      super(...args);
    }
  }

  deploy(
    _router: string,
    _rootAdmin: string,
    _feeClaimer: string,
    _dealerContract: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<Transcrypt> {
    return super.deploy(
      _router,
      _rootAdmin,
      _feeClaimer,
      _dealerContract,
      overrides || {}
    ) as Promise<Transcrypt>;
  }
  getDeployTransaction(
    _router: string,
    _rootAdmin: string,
    _feeClaimer: string,
    _dealerContract: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _router,
      _rootAdmin,
      _feeClaimer,
      _dealerContract,
      overrides || {}
    );
  }
  attach(address: string): Transcrypt {
    return super.attach(address) as Transcrypt;
  }
  connect(signer: Signer): Transcrypt__factory {
    return super.connect(signer) as Transcrypt__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): TranscryptInterface {
    return new utils.Interface(_abi) as TranscryptInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Transcrypt {
    return new Contract(address, _abi, signerOrProvider) as Transcrypt;
  }
}
