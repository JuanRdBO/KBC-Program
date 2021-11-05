import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { AccountInfo } from "@solana/web3.js";
import React, { useContext, useState } from "react";
import { getMints } from "../../logic/get-mints";
import { MetaContextState, MetaState } from "./types";
import { AccountInfo as TokenAccountInfo} from '@solana/spl-token';

var fetchingData = false

export const getEmptyMetaState = (): MetaState => ({
    metadata: [],
    fetchInProgress: false
  });

export interface TokenAccount {
  pubkey: string;
  account: AccountInfo<Buffer>;
  info: TokenAccountInfo;
}

interface MetaproviderProps {
  endpointUrl: string,
  children: any
}

const MetaContext = React.createContext<MetaContextState>({
    ...getEmptyMetaState(),
    isLoading: true,
    metadataLoaded: false,
    // @ts-ignore
    update: () => [],
  });

  
export const useMeta = () => {
  const context = useContext(MetaContext);
  return context;
};
  
export const MetaProvider: React.FC<MetaproviderProps> = ({endpointUrl, children}) => {

  var [state, setState] = useState([]as any)//<MetaState>(getEmptyMetaState());
  const [metadataLoaded, setMetadataLoaded] = useState(false);
  const [isLoading, setisLoading] = useState(true);
  const [fetchedData, setfetchedData] = useState(false);

  const wallet = useAnchorWallet();

  async function update() {
      
      if (wallet && !fetchingData) {
        /* console.log("UPDATE", fetchingData) */
        fetchingData = true

        var metadata = await getMints(wallet.publicKey.toBase58(), endpointUrl);
        setMetadataLoaded(true)
        setisLoading(false)

        setState((current: any) => ({
          ...current,
          metadata
        }))
        console.log("STATE", metadata)
      }
      
  }

  if (!metadataLoaded) {

    if (!fetchedData)
      console.log("Updating...")
      update()
  }

  return (
    <MetaContext.Provider
      value={{
        ...state,
        // @ts-ignore
        update,
        isLoading,
        endpointUrl
      }}
    >
      {children}
    </MetaContext.Provider>
  );

}