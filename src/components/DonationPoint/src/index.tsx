import { ReactElement } from "react";
import { PublicKey } from "@solana/web3.js";
import { TokenListContainer } from "@solana/spl-token-registry";
import {
  ThemeOptions,
} from "@material-ui/core/styles";
import {
  DonationPointContextProvider,
  useDonationPointContext,
} from "./context/DonationPoint";

import { TokenListContextProvider, useTokenMap } from "./context/TokenList";
import { TokenContextProvider, useMint } from "./context/Token";
import {
  DonationPointButton,
  DonationPointHeader,
  DonationPointInput,
} from "./components/DonationPoint";
import TokenDialog from "./components/TokenDialog";
import * as anchor from "@project-serum/anchor";
import DonationPointCard from "./components/DonationPoint";

export default function DonationPoint(props: DonationPointProps): ReactElement {
  const {
    provider,
    tokenList,
    tokenMint,
    amount,
  } = props;


  return (
   
      <TokenListContextProvider tokenList={tokenList}>
        <TokenContextProvider provider={provider}>
          <DonationPointContextProvider
            tokenMint={tokenMint}
            amount={amount}
          >
            <DonationPointCard/>
          </DonationPointContextProvider>
        </TokenContextProvider>
      </TokenListContextProvider>
  );
}

/**
 * Properties for the `Swap` Component.
 */
export type DonationPointProps = {
  /**
   * Wallet and network provider. Apps can use a `Provider` subclass to hook
   * into all transactions intitiated by the component.
   */
  provider: anchor.Provider;

  /**
   * Token list providing information for tokens used.
   */
  tokenList: TokenListContainer;


  /**
   * The default `fromMint` to use when the component first renders.
   */
  tokenMint?: PublicKey;

  /**
   * The initial amount for the `fromMint` to use when the component first
   * renders.
   */
  amount?: number;

  /**
   * Provide custom material-ui theme.
   */
  materialTheme?: ThemeOptions;

  /**
   * Styling properties for the main container.
   */
  containerStyle?: any;

  /**
   * Styling properties for the content container.
   */
  contentStyle?: any;

  /**
   * Styling properties for the from and to token containers.
   */
  tokenContainerStyle?: any;
};

export {
  // Components.
  DonationPoint,
  DonationPointCard,
  DonationPointHeader,
  DonationPointInput,
  DonationPointButton,
  TokenDialog,
  // Providers and context.
  // Swap.
  DonationPointContextProvider,
  useDonationPointContext,
  // TokenList.
  TokenListContextProvider,
  useTokenMap,
  // Token.
  TokenContextProvider,
  useMint,

};
