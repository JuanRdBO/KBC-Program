
import {
    Program, Provider, web3
  } from '@project-serum/anchor';
  import kp from '../keyUtils/keypair.json';
  import idl from '../keyUtils/idl.json';
import { Connection, PublicKey, clusterApiUrl} from '@solana/web3.js';


const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)

console.log("baseAccount", baseAccount.publicKey.toBase58())

// Get our program's id form the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Control's how we want to acknowledge when a trasnaction is "done".
const opts = {
  preflightCommitment: "processed"
}

interface Window {
  solana: any
}

/* export async function getDonationList() {

    // SystemProgram is a reference to the Solana runtime!
    const { SystemProgram, Keypair } = web3;
    const {endpointUrl} = useMeta();
    const wallet = useAnchorWallet();
    
    const [donorList, setDonorList] = useState([] as any);
// donation point

const getProvider = () => {
    console.log("connecting to", endpointUrl)
    //@ts-ignore
    const connection = new Connection(endpointUrl, opts.preflightCommitment);
    const provider = new Provider(
      //@ts-ignore
      connection, window.solana, opts.preflightCommitment,
    );
    return provider;
}

 const getDonorList = async() => {
    console.log("Entered DL")
    try {
      const provider = getProvider();
      //@ts-ignore
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
      console.log("Donor list", account)
      //@ts-ignore
      setDonorList(account.donorList)
    } catch (error) {
      console.log("Error getting donor list", error)
      setDonorList(null);
      createDonorAccount();
    }
  }

  const createDonorAccount = async () => {
    try {
      const provider = getProvider();
      //@ts-ignore
      const program = new Program(idl, programID, provider);
      console.log("ping")
      await program.rpc.entryPoint({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });
      console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
      await getDonorList();

    } catch(error) {
      console.log("Error creating BaseAccount account:", error)
    }
  }

  useEffect(() => {
    if (wallet && !donorList) {
      console.log('Fetching Donor list...');
      getDonorList()
    }
  }, [wallet?.publicKey]);

} */

export const getDonorList = async (endpointUrl: string) => {
    
    const getProvider = () => {
        console.log("connecting to", endpointUrl)
        //@ts-ignore
        const connection = new Connection(endpointUrl, opts.preflightCommitment);
        const provider = new Provider(
          //@ts-ignore
          connection, window.solana, opts.preflightCommitment,
        );
        return provider;
    }
    try {
        const provider = getProvider();
        //@ts-ignore
        const program = new Program(idl, programID, provider);
        const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
        console.log("Donor list", account)
        //@ts-ignore
        return account.donorList
      } catch (error) {
        console.log("Error getting donor list", error)
      }
  }

