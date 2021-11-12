const anchor = require('@project-serum/anchor');
const assert = require("assert");
const solana = require("@solana/web3.js");
const { BN } = require('bn.js');

const { LAMPORTS_PER_SOL, SYSVAR_CLOCK_PUBKEY } = solana;
const { Keypair, SystemProgram, PublicKey } = anchor.web3;

describe('donor_wall_of_fame', () => {


    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.Provider.env());
    console.log("🚀 Starting test...")
  
    const provider = anchor.Provider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.DonorWallOfFame;

    // Creating user +  airdropping some SOL to create big account
    const user = anchor.web3.Keypair.generate();

    // Creating big account
    const baseAccount = anchor.web3.Keypair.generate();

  it('Initializes program by creating Big Account', async () => {
 
    let airdrop_amount = 5;
    console.log("🌭 Airdropping", airdrop_amount, "SOL to user wallet...")
    await airdrop(program.provider.wallet.publicKey, airdrop_amount, provider);

    let user_balance = await program.provider.connection.getBalance(program.provider.wallet.publicKey)
    console.log("User has " + user_balance/LAMPORTS_PER_SOL + " SOL.")

    console.log("User wallet:", program.provider.wallet.publicKey.toBase58())
    console.log("Big account wallet:", baseAccount.publicKey.toBase58())
  
    let create_lamports = await program.provider.connection.getMinimumBalanceForRentExemption(
      304 + 929 * 1000,
    )

    console.log("A user will have to pay", create_lamports/LAMPORTS_PER_SOL, "SOL in order to create this account")

    let tx = await program.rpc.createBaseAccount(
      "KBC donation list",
      new anchor.BN(0), {
      accounts: {
        baseAccount: baseAccount.publicKey,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      instructions: [
        await program.account.baseAccount.createInstruction(baseAccount)
      ],
      signers: [baseAccount]
    });

    user_balance = await program.provider.connection.getBalance(program.provider.wallet.publicKey)
    console.log("User has " + user_balance/LAMPORTS_PER_SOL + " SOL.")

    // tests that the supplied name matches the returned name
    const donationList = await program.account.baseAccount.fetch(baseAccount.publicKey);
    const name = new TextDecoder("utf-8").decode(new Uint8Array(donationList.name));
    assert.ok(name.startsWith("KBC donation list")); // [u8; 280] => trailing zeros.
  });

  it("Creates a stateAccount to add donations", async () => {

    const authority = program.provider.wallet.publicKey;
    const [stateAccount, bump] = await PublicKey.findProgramAddress(
      [authority.toBuffer()],
      program.programId
    );

    await program.rpc.createStateAccount(
      "KWC Admin", 
      bump, {
      accounts: {
        stateAccount,
        authority,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
    });

    // tests
    const account = await program.account.stateAccount.fetch(stateAccount);
    assert.ok(account.name === "KWC Admin");
    assert.ok(account.authority.equals(authority));

  });

  it("Adds donors", async () => {

    const authority = program.provider.wallet.publicKey;
    const user = (
      await PublicKey.findProgramAddress(
        [authority.toBuffer()],
        program.programId
      )
    )[0];
      
    let kekwCoin = new PublicKey("2QK9vxydd7WoDwvVFT5JSU8cwE9xmbJSzeqbRESiPGMG"); 
    console.log("Adding a new donation...");
    for (let i=0; i<1; i++ ) {
      await program.rpc.addDonor(
        "@if__name__main",
        "Juan Ruiz de Bustillo",
        new BN(0),
        kekwCoin,
        new BN(i),
        false,
        "_", {
        accounts: {
          user,
          authority,
          baseAccount: baseAccount.publicKey,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY
        },
      });
      console.log("Donated " + i + " times..")
    }

    // Check the donor list state is as expected.
    const donorList = await program.account.baseAccount.fetch(baseAccount.publicKey);
    const name = new TextDecoder("utf-8").decode(new Uint8Array(donorList.name));
    console.log("DonationList name is " + name);
    assert.ok(name.startsWith("KBC donation list")); // [u8; 280] => trailing zeros.
  });

  it("Closes donor list once donations are no longer needed", async () => {
    
    let UserAccountBalance = await program.provider.connection.getBalance(program.provider.wallet.publicKey)
    console.log("UserAccount has " + UserAccountBalance/LAMPORTS_PER_SOL + " SOL.")
    
    let baseAccountBalance = await program.provider.connection.getBalance(baseAccount.publicKey)
    console.log("BaseAccount has " + baseAccountBalance/LAMPORTS_PER_SOL + " SOL.")
    
    await program.rpc.closeAccount(
      {
      accounts: {
        authority: program.provider.wallet.publicKey,
        accToClose: baseAccount.publicKey,
        donorProgram: program.programId
      }
    });

    console.log("BaseAccount closed!")

    UserAccountBalance = await program.provider.connection.getBalance(program.provider.wallet.publicKey)
    console.log("UserAccount has " + UserAccountBalance/LAMPORTS_PER_SOL + " SOL.")
    
    baseAccountBalance = await program.provider.connection.getBalance(baseAccount.publicKey)
    console.log("BaseAccount has " + baseAccountBalance/LAMPORTS_PER_SOL + " SOL.")
    
  });

  async function airdrop(publicKey, amount, provider) {
    await provider.connection
      .requestAirdrop(publicKey, amount * LAMPORTS_PER_SOL)
      .then((sig) => provider.connection.confirmTransaction(sig, "confirmed"));
  }

});
