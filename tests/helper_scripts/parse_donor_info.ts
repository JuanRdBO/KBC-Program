import * as anchor from "@project-serum/anchor";
import { DonorInfo, DonationInfo, Donation, DonatedToken } from "./helper_types";

export function parseDonorInfo(account: any) {
  let finalDonorList: DonorInfo[] = [];
  let finalDonationsList: DonationInfo[] = [];

  //@ts-ignore
  account.donorList.forEach((d) => {
    let donorIndex = finalDonorList.map((m) => m.userAddress.toBase58()).indexOf(d["donorUserAddress"].toBase58());

    // removes empty fields
    if (new TextDecoder("utf-8").decode(new Uint8Array(d["donorName"])).startsWith("\u0000")) return;

    if (donorIndex === -1) {
      //if (new anchor.BN(d['donatedToken']['timeStamp']).toNumber() == 0) {return}
      let donation = new Donation({
        donatedAmount:
          new anchor.BN(d["donatedToken"]["donatedAmount"]).toNumber() === 0
            ? new anchor.BN(d["donatedSol"])
            : new anchor.BN(d["donatedToken"]["donatedAmount"]),
        timestamp: d["donatedToken"]["timestamp"],
      });

      let donatedToken = new DonatedToken({
        arweaveLink: new TextDecoder("utf-8")
          .decode(new Uint8Array(d["donatedToken"]["arweaveLink"]))
          .replaceAll("\u0000", ""),
        donatedAmount: [donation] as Donation[],
        donatedToken: d["donatedToken"]["donatedToken"],
        isNft: d["donatedToken"]["isNft"],
      });

      let donorInfo = new DonorInfo({
        donatedSol: new anchor.BN(d["donatedSol"]),
        donatedTokens: [donatedToken] as DonatedToken[],
        donorName: new TextDecoder("utf-8").decode(new Uint8Array(d["donorName"])).replaceAll("\u0000", ""),
        twitterHandle: new TextDecoder("utf-8")
          .decode(new Uint8Array(d["donorTwitterHandle"]))
          .replaceAll("\u0000", ""),
        userAddress: new anchor.web3.PublicKey(d["donorUserAddress"]),
      });

      finalDonorList.push(donorInfo);

      let donationInfo = new DonationInfo({
        donorName: donorInfo.donorName,
        donorTwitter: donorInfo.twitterHandle,
        arweaveLink: donatedToken.arweaveLink,
        donatedAmount: donation.donatedAmount.toNumber(),
        amountInSol: 0,
        donatedToken: donatedToken.donatedToken,
        isNft: donatedToken.isNft,
        timestamp: new Date(donation.timestamp * 1000).toLocaleString(),
      });

      finalDonationsList.push(donationInfo);
    } else {
      // append to array of donations
      let donation = new Donation({
        donatedAmount:
          new anchor.BN(d["donatedToken"]["donatedAmount"]).toNumber() === 0
            ? new anchor.BN(d["donatedSol"])
            : new anchor.BN(d["donatedToken"]["donatedAmount"]),
        timestamp: d["donatedToken"]["timestamp"],
      });

      // append to array to doanted tokens
      let donatedToken = new DonatedToken({
        arweaveLink: new TextDecoder("utf-8")
          .decode(new Uint8Array(d["donatedToken"]["arweaveLink"]))
          .replaceAll("\u0000", ""),
        donatedAmount: [donation] as Donation[],
        donatedToken: d["donatedToken"]["donatedToken"],
        isNft: d["donatedToken"]["isNft"],
      });

      // TODO: Fucking ugly. @Nico HALP!
      finalDonorList[donorIndex].donatedSol = new anchor.BN(
        new anchor.BN(d["donatedSol"]).toNumber() + finalDonorList[donorIndex].donatedSol.toNumber()
      );
      finalDonorList[donorIndex].donatedTokens.push(donatedToken);

      let donationInfo = new DonationInfo({
        donorName: finalDonorList[donorIndex].donorName,
        donorTwitter: finalDonorList[donorIndex].twitterHandle,
        arweaveLink: donatedToken.arweaveLink,
        donatedAmount: donation.donatedAmount.toNumber(),
        amountInSol: 0,
        donatedToken: donatedToken.donatedToken,
        isNft: donatedToken.isNft,
        timestamp: new Date(donation.timestamp * 1000).toLocaleString(),
      });

      finalDonationsList.push(donationInfo);
    }
  });

  //console.log("Parsed donors list", finalDonorList)

  return { finalDonorList, finalDonationsList };
}
