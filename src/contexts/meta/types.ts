import {Metadata} from "../../logic/get-mints"
import { AccountInfo } from '@solana/web3.js';

export type StringPublicKey = string;


export interface ParsedAccountBase {
    data: any
    info: any; // TODO: change to unknown
  }
  
  export interface ParsedAccount<T> extends ParsedAccountBase {
    info: T;
  }

export interface MetaState {
    metadata: Metadata[];
    fetchInProgress: boolean;
  }

  export interface MetaContextState extends MetaState {
    isLoading: boolean;
    metadataLoaded: boolean;
    endpointUrl: string;
    pullAllMetadata: () => void;
  }