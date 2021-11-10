import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { AccountInfo, PublicKey, SystemProgram, Connection } from "@solana/web3.js";
import React, { useContext,  useState } from "react";
import { getMints } from "../../logic/get-mints";
import { MetaContextState, MetaState } from "./types";
import { AccountInfo as TokenAccountInfo} from '@solana/spl-token';
import {Program, Provider, web3 } from "@project-serum/anchor";

import kp from '../../keyUtils/keypair.json';
import idl from '../../keyUtils/idl.json';
import { DonorInfo, parseDonorInfo } from "../../components/DonationPoint/src/components/DonationPoint";

var fetchingData = false


const DONOR_PROGRAM = new web3.PublicKey(
  '5H2JKX3762zPTemxAWtW1naY9yTX7i2tiTzyk4Xnrx9t',
);  

const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)



// Control's how we want to acknowledge when a trasnaction is "done".
const opts = {
  preflightCommitment: "processed"
}

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
  children: any,
}

const MetaContext = React.createContext<MetaContextState>({
    ...getEmptyMetaState(),
    isLoading: true,
    metadataLoaded: false,
    donorsInfoList: [],
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
  const [donorsInfoList, setDonorsInfoList] = useState<DonorInfo[]>();

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

        // Check for new Donor Hall Of Fame ID
        // TODO: move this out of the way
        // Get our program's id form the IDL file.

        const getProvider = () => {
          //@ts-ignore
          const connection = new Connection(endpointUrl, opts.preflightCommitment);
          const provider = new Provider(
            //@ts-ignore
            connection, window.solana, opts.preflightCommitment,
          );
          return provider;
        }
        const provider = getProvider();
        
        const programID = new PublicKey(idl.metadata.address);

        const createDonorAccount = async () => {
          try {
            const provider = getProvider();
            //@ts-ignore
            const program = new Program(idl, programID, provider);
            await program.rpc.entryPoint({
              accounts: {
                baseAccount: baseAccount.publicKey,
                user: provider.wallet.publicKey,
                systemProgram: SystemProgram.programId,
              },
              signers: [baseAccount]
            });
            console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
      
          } catch(error) {
            console.log("Error creating BaseAccount account:", error)
          }
        }

        try {
          // to do this, initialize idl with  anchor idl init --filepath target/idl/donorhalloffame.json 13GyyY88tFKDB5Ezdiyhv1wyXW1hNipnHWL2sVcLrUpi
          const idl2 = await Program.fetchIdl(DONOR_PROGRAM, provider);
          const program = new Program(idl2, DONOR_PROGRAM, provider);
          let account = await program.account.baseAccount.fetch(baseAccount.publicKey);
          setDonorsInfoList(parseDonorInfo(account));
        } catch {
          await createDonorAccount();
        }
      }
  }

  if (!metadataLoaded) {
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
        endpointUrl,
        donorsInfoList,
      }}
    >
      {children}
    </MetaContext.Provider>
  );

}