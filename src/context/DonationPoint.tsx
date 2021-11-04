import * as assert from "assert";
import React, { useContext, useState, useEffect } from "react";
import { useAsync } from "react-async-hook";
import { PublicKey } from "@solana/web3.js";
import {
  Token,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Market } from "@project-serum/serum";
import { SRM_MINT, USDC_MINT, USDT_MINT } from "../utils/pubkeys";

import { useOwnedTokenAccount } from "./Token";


const DONATION_ADDRESS = '';


export type DonationPointContext = {
  // Mint being donated from. The user must own these tokens.
  mint: PublicKey;
  setMint: (m: PublicKey) => void;

  // Amount used for the donation.
  amount: number;
  setAmount: (a: number) => void;
};

const _DonationPointContext = React.createContext<null | DonationPointContext>(null);

export function DonationPointContextProvider(props: any) {
  const [mint, setMint] = useState(props.mint ?? SRM_MINT);
  const [amount, setAmount] = useState(props.amount ?? 0);

  const setFromAmount = (amount: number) => {
    setAmount(amount);
  };

  return (
    <_DonationPointContext.Provider
      value={{
        mint,
        setMint,
        amount,
        setAmount,
      }}
    >
      {props.children}
    </_DonationPointContext.Provider>
  );
}

export function useDonationPointContext(): DonationPointContext {
  const ctx = useContext(_DonationPointContext);
  if (ctx === null) {
    throw new Error("Context not available");
  }
  return ctx;
}



// Returns true if the user can swap with the current context.
export function useCanDonate(): boolean {
  const { mint, amount } = useDonationPointContext();
  /* const { swapClient } = useDexContext(); */
  //const { wormholeMap, solletMap } = useTokenListContext();
  const fromWallet = useOwnedTokenAccount(mint);
  /* const route = useRouteVerbose(mint, DONATION_ADDRESS);
  if (route === null) {
    return false;
  } */

  return (
    // From wallet exists.
    fromWallet !== undefined &&
    fromWallet !== null &&

    // Wallet is connected.
    /* swapClient.program.provider.wallet.publicKey !== null && */
    // Donate amounts greater than zero.
    amount > 0

    // Wormhole <-> native markets must have the wormhole token as the
    // *from* address since they're one-sided markets.
    /* (route.kind !== "wormhole-native" ||
      wormholeMap
        .get(mint.toString())
        ?.tags?.includes(SPL_REGISTRY_WORM_TAG) !== undefined) && */
    // Wormhole <-> sollet markets must have the sollet token as the
    // *from* address since they're one sided markets.
    /* (route.kind !== "wormhole-sollet" ||
      solletMap
        .get(mint.toString())
        ?.tags?.includes(SPL_REGISTRY_SOLLET_TAG) !== undefined) */
  );
}