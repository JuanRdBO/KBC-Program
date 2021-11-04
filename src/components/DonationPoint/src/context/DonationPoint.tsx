import React, { useContext, useState } from "react";
import { PublicKey } from "@solana/web3.js";

import { SRM_MINT,  } from "../utils/pubkeys";


export type DonationPointContext = {
  // Mint being traded from. The user must own these tokens.
  tokenMint: PublicKey;
  setTokenMint: (m: PublicKey) => void;

  // Amount used for the swap.
  amount: number;
  setAmount: (a: number) => void;

  // True if all newly created market accounts should be closed in the
  // same user flow (ideally in the same transaction).
  isClosingNewAccounts: boolean;

  // True if the swap exchange rate should be a function of nothing but the
  // from and to tokens, ignoring any quote tokens that may have been
  // accumulated by performing the swap.
  //
  // Always false (for now).
  isStrict: boolean;
  setIsStrict: (isStrict: boolean) => void;

  setIsClosingNewAccounts: (b: boolean) => void;
};
const _DonationPointContext = React.createContext<null | DonationPointContext>(null);

export function DonationPointContextProvider(props: any) {
  const [tokenMint, setTokenMint] = useState(props.tokenMint ?? SRM_MINT);
  const [amount, _setAmount] = useState(props.amount ?? 0);
  const [isClosingNewAccounts, setIsClosingNewAccounts] = useState(false);
  const [isStrict, setIsStrict] = useState(false);

  const setAmount = (amount: number) => {

    _setAmount(amount);
  };

  return (
    <_DonationPointContext.Provider
      value={{
        tokenMint,
        setTokenMint,
        amount,
        setAmount,
        isClosingNewAccounts,
        isStrict,
        setIsStrict,
        setIsClosingNewAccounts,
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


