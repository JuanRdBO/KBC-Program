import * as anchor from "@project-serum/anchor";

export class DonorInfo {
  donatedSol: anchor.BN;
  donatedTokens: DonatedToken[];
  donorName: string;
  twitterHandle: string;
  userAddress: anchor.web3.PublicKey;
  constructor(args: {
    donatedSol: anchor.BN;
    donatedTokens: DonatedToken[];
    donorName: string;
    twitterHandle: string;
    userAddress: anchor.web3.PublicKey;
  }) {
    this.donatedSol = args.donatedSol;
    this.donatedTokens = args.donatedTokens;
    this.donorName = args.donorName;
    this.twitterHandle = args.twitterHandle;
    this.userAddress = args.userAddress;
  }
}

export class DonatedToken {
  arweaveLink: string;
  donatedAmount: Donation[];
  donatedToken: anchor.web3.PublicKey;
  isNft: boolean;
  constructor(args: {
    arweaveLink: string;
    donatedAmount: Donation[];
    donatedToken: anchor.web3.PublicKey;
    isNft: boolean;
  }) {
    this.arweaveLink = args.arweaveLink;
    this.donatedAmount = args.donatedAmount;
    this.donatedToken = args.donatedToken;
    this.isNft = args.isNft;
  }
}

export class Donation {
  donatedAmount: anchor.BN;
  timestamp: number;
  constructor(args: { donatedAmount: anchor.BN; timestamp: number }) {
    this.donatedAmount = args.donatedAmount;
    this.timestamp = args.timestamp;
  }
}

export class DonationInfo {
  donorName: string;
  donorTwitter: string;
  arweaveLink: string;
  donatedAmount: number;
  amountInSol: number;
  donatedToken: anchor.web3.PublicKey;
  isNft: boolean;
  timestamp: string;
  constructor(args: {
    donorName: string;
    donorTwitter: string;
    arweaveLink: string;
    donatedAmount: number;
    amountInSol: number;
    donatedToken: anchor.web3.PublicKey;
    isNft: boolean;
    timestamp: string;
  }) {
    this.donorName = args.donorName;
    this.donorTwitter = args.donorTwitter;
    this.arweaveLink = args.arweaveLink;
    this.donatedAmount = args.donatedAmount;
    this.amountInSol = args.amountInSol;
    this.donatedToken = args.donatedToken;
    this.isNft = args.isNft;
    this.timestamp = args.timestamp;
  }
}
