import * as anchor from "@project-serum/anchor";
import { ConfirmOptions } from "@solana/web3.js";
import { DonorInfo, DonationInfo } from "./helper_types";
import { parseDonorInfo } from "./parse_donor_info";
import assert from "assert";
import { NodeWallet } from "@project-serum/anchor/dist/cjs/provider";
import * as fs from "fs";

const DONOR_PROGRAM_ID = new anchor.web3.PublicKey("FK3H6Bwnm3L8eGFHKrBZpZpRB5SFwfk2mRFX4tnGP6L7");
const DONOR_AUTHORITY = new anchor.web3.PublicKey("juan3uxteK3E4ikyTeAg2AYRKzBS7CJ4dkGmx7zyHMv");

const admin_wallet = loadWalletKey("/home/joan/.config/solana/id.json");
const endpointUrl = "https://api.devnet.solana.com";

const getProvider = (endpointUrl, wallet) => {
  const opts: ConfirmOptions = {
    preflightCommitment: "confirmed",
  };
  const connection = new anchor.web3.Connection(endpointUrl, opts.preflightCommitment);
  const provider = new anchor.Provider(connection, new NodeWallet(wallet), opts);
  return provider;
};

export function loadWalletKey(keypair): anchor.web3.Keypair {
  if (!keypair || keypair == "") {
    throw new Error("Keypair is required!");
  }
  const loaded = anchor.web3.Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync(keypair).toString())));
  console.log(`wallet public key: ${loaded.publicKey}`);
  return loaded;
}

const getProgramEnv = async (programId, endpointUrl, wallet) => {
  try {
    const provider = getProvider(endpointUrl, wallet);
    // to do this, initialize idl with  anchor idl init --filepath target/idl/donorhalloffame.json 13GyyY88tFKDB5Ezdiyhv1wyXW1hNipnHWL2sVcLrUpi
    const idl = await anchor.Program.fetchIdl(programId, provider);
    if (!idl) throw new Error("IDL could not get set");
    const program = new anchor.Program(idl, programId, provider);
    return program;
  } catch (e) {
    console.log("Error when setting environment", e);
  }
};

async function getStateAccount(program) {
  const [stateAccount, bump] = await anchor.web3.PublicKey.findProgramAddress(
    [DONOR_AUTHORITY.toBuffer()],
    program.programId
  );

  const programState = await program.account.stateAccount.fetch(stateAccount);

  return programState;
}

async function getDonorLists(program: anchor.Program, programState: anchor.web3.PublicKey) {
  let allDonorsLists: DonorInfo[] = [];
  let allDonationsLists: DonationInfo[] = [];
  let allBaseAccounts: [string, anchor.web3.PublicKey, string, string][] = [];
  let allBaseAccountNames: string[] = [];

  //@ts-ignore
  for (let i = 0; i < programState.donorLists.length; i += 1) {
    //@ts-ignore
    let baseAccount = programState.donorLists[i];

    if (baseAccount.toBase58() != "6TvoT4RSjnjgpMb1zogFeEnKmv5AF9HAu6AyL3R9VU7T") {
      // OOps!
      //console.log("BaseAccount", baseAccount)

      let account = await program.account.baseAccount.fetch(baseAccount);

      const { finalDonorList, finalDonationsList } = parseDonorInfo(account);
      allDonorsLists = [...allDonorsLists, ...finalDonorList];
      allDonationsLists = [...allDonationsLists, ...finalDonationsList];

      allBaseAccounts.push([
        new TextDecoder("utf-8").decode(new Uint8Array(account.name)).replaceAll("\u0000", ""),
        baseAccount.toBase58(),
        `Total unique donors: ${finalDonorList.length}`,
        `Total donations: ${finalDonationsList.length}`,
      ]);
    }
  }

  return { allDonorsLists, allDonationsLists, allBaseAccounts };
}

export const updateStateAccount = async (program: anchor.Program, baseAccount: anchor.web3.Keypair) => {
  // fetches stateAccount
  const authority = program.provider.wallet.publicKey;
  const [stateAccount, bump] = await anchor.web3.PublicKey.findProgramAddress(
    [authority.toBuffer()],
    program.programId
  );

  // Updates stateAccount
  await program.rpc.addDonationList(baseAccount.publicKey, {
    accounts: {
      stateAccount,
      authority,
    },
  });
};

async function createNewBaseAccount(program: anchor.Program) {
  // Creating big account
  const baseAccount = anchor.web3.Keypair.generate();

  let create_lamports = await program.provider.connection.getMinimumBalanceForRentExemption(304 + 929 * 1000);
  let user_balance = await program.provider.connection.getBalance(admin_wallet.publicKey);

  console.log(
    "A user has",
    user_balance / anchor.web3.LAMPORTS_PER_SOL,
    "SOL and will have to pay",
    create_lamports / anchor.web3.LAMPORTS_PER_SOL,
    "SOL in order to create this account",
    program.provider.wallet
  );

  let tx = await program.rpc.createBaseAccount("KBC donation list", new anchor.BN(0), {
    accounts: {
      baseAccount: baseAccount.publicKey,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    },
    instructions: [await program.account.baseAccount.createInstruction(baseAccount)],
    signers: [baseAccount],
  });

  await updateStateAccount(program, baseAccount);

  user_balance = await program.provider.connection.getBalance(admin_wallet.publicKey);
  console.log("After tx:", tx, ", user has " + user_balance / anchor.web3.LAMPORTS_PER_SOL + " SOL.");

  // tests that the supplied name matches the returned name
  const bigAccount = await program.account.baseAccount.fetch(baseAccount.publicKey);
  //@ts-ignore
  const name = new TextDecoder("utf-8").decode(new Uint8Array(bigAccount.name));
  assert.ok(name.startsWith("KBC donation list")); // [u8; 280] => trailing zeros.

  return baseAccount;
}

async function refundBaseAccount(program, baseAccountToDelete) {
  const authority = program.provider.wallet.publicKey;

  let UserAccountBalance = await program.provider.connection.getBalance(authority);
  console.log("UserAccount has " + UserAccountBalance / anchor.web3.LAMPORTS_PER_SOL + " SOL.");

  let baseAccountBalance = await program.provider.connection.getBalance(baseAccountToDelete);
  console.log("BaseAccount has " + baseAccountBalance / anchor.web3.LAMPORTS_PER_SOL + " SOL.");

  const [stateAccount, bump] = await anchor.web3.PublicKey.findProgramAddress(
    [authority.toBuffer()],
    program.programId
  );

  await program.rpc.closeBaseAccount({
    accounts: {
      authority: authority,
      stateAccount: stateAccount,
      accToClose: baseAccountToDelete,
      donorProgram: program.programId,
    },
  });

  console.log("StateAccount closed!");

  UserAccountBalance = await program.provider.connection.getBalance(authority);
  console.log("UserAccount has " + UserAccountBalance / anchor.web3.LAMPORTS_PER_SOL + " SOL.");

  baseAccountBalance = await program.provider.connection.getBalance(baseAccountToDelete);
  console.log("BaseAccount has " + baseAccountBalance / anchor.web3.LAMPORTS_PER_SOL + " SOL.");
}

async function getDonorListInfo(program: anchor.Program, addNewBaseAccount: boolean) {
  if (addNewBaseAccount) await createNewBaseAccount(program);

  const programState = await getStateAccount(program);

  const { allDonorsLists, allDonationsLists, allBaseAccounts } = await getDonorLists(program, programState);

  return { programState, allDonorsLists, allDonationsLists, allBaseAccounts };
}

async function main(addNewBaseAccount, baseAccountToDelete) {
  const program = await getProgramEnv(DONOR_PROGRAM_ID, endpointUrl, admin_wallet);

  if (baseAccountToDelete) {
    await refundBaseAccount(program, baseAccountToDelete);
    return;
  }

  const { programState, allDonorsLists, allDonationsLists, allBaseAccounts } = await getDonorListInfo(
    program,
    addNewBaseAccount
  );

  console.log("* ProgramState Name", programState.name);
  console.log("* ProgramState authority pk", programState.authority.toBase58());
  console.log("* ProgramState treasury pk", programState.donationTreasury.toBase58());
  console.log("* ProgramState cnt donor lists", programState.totalDonorLists);
  console.log("* ProgramState donor lists", allBaseAccounts);

  //console.log("allDonationsLists", allDonationsLists);
  //console.log("allDonorsLists", allDonorsLists);
}

/************************************
 *    RUN DOWN HERE YOUR COMMANDS   *
 ************************************/

const addNewBaseAccount = false;
const baseAccountToDelete = undefined; //new anchor.web3.PublicKey("6z23QvjcnjYNdKADAJcGvLrdKzfKNibLrxEeKtDMkqaa");

main(addNewBaseAccount, baseAccountToDelete);
