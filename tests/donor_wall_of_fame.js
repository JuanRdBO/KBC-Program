const anchor = require("@project-serum/anchor");
const assert = require("assert");
const solana = require("@solana/web3.js");
const splToken = require("@solana/spl-token");
const { BN } = require("bn.js");

const { LAMPORTS_PER_SOL, SYSVAR_CLOCK_PUBKEY } = solana;
const { Keypair, SystemProgram, PublicKey } = anchor.web3;

describe("donor_wall_of_fame", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());
  console.log("🚀 Starting test...");

  const provider = anchor.Provider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.DonorWallOfFame;

  // Creating user +  airdropping some SOL to create big account
  const user = anchor.web3.Keypair.generate();

  // Creating big account
  const baseAccount = anchor.web3.Keypair.generate();

  // creates a receiver wallet to receive SOL and SPL tokens (donations)
  let receiver = anchor.web3.Keypair.generate();

  it("Creates a stateAccount to store list donations", async () => {
    const authority = program.provider.wallet.publicKey;
    const [stateAccount, bump] = await PublicKey.findProgramAddress([authority.toBuffer()], program.programId);

    await program.rpc.createStateAccount("KWC Admin", receiver.publicKey, bump, {
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
    assert.ok(account.totalDonorLists === 0);

    console.log("StateAccount:", stateAccount.toBase58());
  });

  it("Initializes program by creating Big baseAccount", async () => {
    let airdrop_amount = 5;
    console.log("🌭 Airdropping", airdrop_amount, "SOL to user wallet...");
    await airdrop(program.provider.wallet.publicKey, airdrop_amount, provider);

    let user_balance = await program.provider.connection.getBalance(program.provider.wallet.publicKey);
    console.log("User has " + user_balance / LAMPORTS_PER_SOL + " SOL.");

    console.log("User wallet:", program.provider.wallet.publicKey.toBase58());
    console.log("Big account wallet:", baseAccount.publicKey.toBase58());

    let create_lamports = await program.provider.connection.getMinimumBalanceForRentExemption(304 + 929 * 1000);

    console.log("A user will have to pay", create_lamports / LAMPORTS_PER_SOL, "SOL in order to create this account");

    let tx = await program.rpc.createBaseAccount("KBC donation list", new anchor.BN(0), {
      accounts: {
        baseAccount: baseAccount.publicKey,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      instructions: [await program.account.baseAccount.createInstruction(baseAccount)],
      signers: [baseAccount],
    });

    user_balance = await program.provider.connection.getBalance(program.provider.wallet.publicKey);
    console.log("User has " + user_balance / LAMPORTS_PER_SOL + " SOL.");

    // tests that the supplied name matches the returned name
    const bigAccount = await program.account.baseAccount.fetch(baseAccount.publicKey);
    const name = new TextDecoder("utf-8").decode(new Uint8Array(bigAccount.name));
    assert.ok(name.startsWith("KBC donation list")); // [u8; 280] => trailing zeros.
  });

  it("Updating stateAccount to add new donation list", async () => {
    // fetches stateAccount
    const authority = program.provider.wallet.publicKey;
    const [stateAccount, bump] = await PublicKey.findProgramAddress([authority.toBuffer()], program.programId);

    // Updates stateAccount
    await program.rpc.addDonationList(baseAccount.publicKey, {
      accounts: {
        stateAccount,
        authority,
      },
    });
    // tests
    const account = await program.account.stateAccount.fetch(stateAccount);
    assert.ok(account.name === "KWC Admin");
    assert.ok(account.authority.equals(authority));
    console.log("ACC", account);
  });

  /*   it("Admin adds donors", async () => {
    const authority = program.provider.wallet.publicKey;
    const stateAccount = (await PublicKey.findProgramAddress([authority.toBuffer()], program.programId))[0];

    let kekwCoin = new PublicKey("2QK9vxydd7WoDwvVFT5JSU8cwE9xmbJSzeqbRESiPGMG");
    console.log("Adding a new donation...");
    for (let i = 0; i < 1; i++) {
      await program.rpc.addDonor(
        "@if__name__main",
        "Juan Ruiz de Bustillo",
        new BN(0),
        new BN(0),
        kekwCoin,
        new BN(i),
        false,
        "_",
        {
          accounts: {
            stateAccount,
            authority,
            baseAccount: baseAccount.publicKey,
            clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
          },
        }
      );
      console.log("Donated " + i + " times..");
    }

    // Check the donor list state is as expected.
    const donorList = await program.account.baseAccount.fetch(baseAccount.publicKey);
    const name = new TextDecoder("utf-8").decode(new Uint8Array(donorList.name));
    console.log("DonationList name is " + name);
    assert.ok(name.startsWith("KBC donation list")); // [u8; 280] => trailing zeros.
  });

  it("Random guy adds donors (simple donation)", async () => {
    const authorityKeypair = Keypair.generate();

    await airdrop(authorityKeypair.publicKey, 5, provider);

    const authority = authorityKeypair.publicKey;
    const stateAccount = (
      await PublicKey.findProgramAddress([program.provider.wallet.publicKey.toBuffer()], program.programId)
    )[0];

    let kekwCoin = new PublicKey("2QK9vxydd7WoDwvVFT5JSU8cwE9xmbJSzeqbRESiPGMG");
    console.log("Adding a new donation...");
    for (let i = 0; i < 1; i++) {
      await program.rpc.addDonor(
        "@if__name__main",
        "Juan Ruiz de Bustillo",
        new BN(0),
        new BN(0),
        kekwCoin,
        new BN(i),
        false,
        "_",
        {
          accounts: {
            stateAccount,
            authority,
            baseAccount: baseAccount.publicKey,
            clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
          },
          signers: [authorityKeypair],
        }
      );
      console.log("Donated " + i + " times..");
    }

    // Check the donor list state is as expected.
    const donorList = await program.account.baseAccount.fetch(baseAccount.publicKey);
    const name = new TextDecoder("utf-8").decode(new Uint8Array(donorList.name));
    console.log("DonationList name is " + name);
    assert.ok(name.startsWith("KBC donation list")); // [u8; 280] => trailing zeros.
  }); */

  it("Random guy adds donors (Also donates some SOL)", async () => {
    const authorityKeypair = Keypair.generate();

    await airdrop(authorityKeypair.publicKey, 5, provider);

    const authority = authorityKeypair.publicKey;
    const stateAccount = (
      await PublicKey.findProgramAddress([program.provider.wallet.publicKey.toBuffer()], program.programId)
    )[0];

    let receiverAccountBalance = await program.provider.connection.getBalance(receiver.publicKey);
    console.log("receiverAccount has " + receiverAccountBalance / LAMPORTS_PER_SOL + " SOL.");

    let kekwCoin = new PublicKey("2QK9vxydd7WoDwvVFT5JSU8cwE9xmbJSzeqbRESiPGMG");
    console.log("Adding a new donation...");
    await program.rpc.addDonor(
      "@if__name__main",
      "Juan Ruiz de Bustillo",
      new BN(0),
      new BN(0),
      kekwCoin, // he it would be SOL mint
      new BN(0),
      false,
      "_",
      new BN(LAMPORTS_PER_SOL),
      {
        accounts: {
          stateAccount,
          authority,
          baseAccount: baseAccount.publicKey,
          donationTreasury: receiver.publicKey,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
          systemProgram: SystemProgram.programId,
        },
        signers: [authorityKeypair],
      }
    );

    receiverAccountBalance = await program.provider.connection.getBalance(receiver.publicKey);
    console.log("receiverAccount has " + receiverAccountBalance / LAMPORTS_PER_SOL + " SOL.");

    // Check the donor list state is as expected.
    const donorList = await program.account.baseAccount.fetch(baseAccount.publicKey);
    const name = new TextDecoder("utf-8").decode(new Uint8Array(donorList.name));
    console.log("DonationList name is " + name);
    assert.ok(name.startsWith("KBC donation list")); // [u8; 280] => trailing zeros.
  });

  it("Closes donor list once donations are no longer needed", async () => {
    let UserAccountBalance = await program.provider.connection.getBalance(program.provider.wallet.publicKey);
    console.log("UserAccount has " + UserAccountBalance / LAMPORTS_PER_SOL + " SOL.");

    let baseAccountBalance = await program.provider.connection.getBalance(baseAccount.publicKey);
    console.log("BaseAccount has " + baseAccountBalance / LAMPORTS_PER_SOL + " SOL.");

    const [stateAccount, bump] = await PublicKey.findProgramAddress(
      [program.provider.wallet.publicKey.toBuffer()],
      program.programId
    );

    await program.rpc.closeBaseAccount({
      accounts: {
        authority: program.provider.wallet.publicKey,
        stateAccount: stateAccount,
        accToClose: baseAccount.publicKey,
        donorProgram: program.programId,
      },
    });

    console.log("BaseAccount closed!");

    UserAccountBalance = await program.provider.connection.getBalance(program.provider.wallet.publicKey);
    console.log("UserAccount has " + UserAccountBalance / LAMPORTS_PER_SOL + " SOL.");

    baseAccountBalance = await program.provider.connection.getBalance(baseAccount.publicKey);
    console.log("BaseAccount has " + baseAccountBalance / LAMPORTS_PER_SOL + " SOL.");
  });

  /*   it("Performs a SOL transfer", async () => {
    let receiverBalance = await provider.connection.getBalance(receiver.publicKey);
    const amount = 1;
    console.log(`💰 Initial wallet balance of ${receiver.publicKey}: ${receiverBalance / LAMPORTS_PER_SOL} SOL`);
    console.log(`💸 Transfering ${amount} SOL from ${provider.wallet.publicKey} to ${receiver.publicKey}...`);

    let tx = await program.rpc.sendSol(new anchor.BN(amount * LAMPORTS_PER_SOL), {
      accounts: {
        from: provider.wallet.publicKey,
        to: receiver.publicKey,
        systemProgram: SystemProgram.programId,
      },
    });

    console.log("📝 SOL transfer transaction signature:", tx);

    receiverBalance = await provider.connection.getBalance(receiver.publicKey);
    console.log(`💰 Final wallet balance of ${receiver.publicKey}: ${receiverBalance / LAMPORTS_PER_SOL} SOL`);
  }); */

  /*   it("Performs an SPL token transfer", async () => {
    // Creating a new random mint
    let randomMint = await splToken.Token.createMint(
      provider.connection,
      receiver,
      receiver.publicKey,
      null,
      0,
      splToken.TOKEN_PROGRAM_ID
    );
    console.log(`⌛ Created random Mint ${randomMint.publicKey}`);

    // initializing the account for both sender and receiver
    providerWalletTokenAccount = await randomMint.createAccount(program.provider.wallet.publicKey);

    receiverWalletTokenAccount = await randomMint.createAccount(receiver.publicKey);

    console.log(
      `⏰ Initialized random MintAccount on provider: ${providerWalletTokenAccount} and on receiver: ${receiverWalletTokenAccount}`
    );

    // mint 100 tokens to the receiver address
    let mintAmount = 100;
    await randomMint.mintTo(providerWalletTokenAccount, receiver.publicKey, [receiver], mintAmount);

    console.log(`⛄ Minted ${mintAmount} tokens to ${receiver.publicKey}`);

    // Get account info about SPL token wallet balances
    let providerAccountInfo = await randomMint.getAccountInfo(providerWalletTokenAccount);
    let receiverAccountInfo = await randomMint.getAccountInfo(receiverWalletTokenAccount);

    let providerBalance = await provider.connection.getBalance(program.provider.wallet.publicKey);
    let receiverBalance = await provider.connection.getBalance(receiver.publicKey);
    console.log(`⛽  -> Provider wallet ${program.provider.wallet.publicKey} has ${
      providerAccountInfo.amount
    } tokens and ${providerBalance / LAMPORTS_PER_SOL} SOL.
    -> Receiver Wallet ${receiver.publicKey} has ${receiverAccountInfo.amount} Tokens and ${
      receiverBalance / LAMPORTS_PER_SOL
    } SOL.`);

    const [_pda, _nonce] = await PublicKey.findProgramAddress(
      [Buffer.from(anchor.utils.bytes.utf8.encode("donor"))],
      program.programId
    );

    let tx = await program.rpc.sendSpl(new anchor.BN(30), {
      accounts: {
        authority: provider.wallet.publicKey,
        to: receiverWalletTokenAccount,
        from: providerWalletTokenAccount,
        tokenProgram: splToken.TOKEN_PROGRAM_ID,
      },
    });

    console.log("📝 SPL token transfer transaction signature:", tx);

    // update balance variables
    providerAccountInfo = await randomMint.getAccountInfo(providerWalletTokenAccount);
    receiverAccountInfo = await randomMint.getAccountInfo(receiverWalletTokenAccount);
    providerBalance = await provider.connection.getBalance(program.provider.wallet.publicKey);
    receiverBalance = await provider.connection.getBalance(receiver.publicKey);

    console.log(`⛳  -> Provider wallet ${program.provider.wallet.publicKey} has ${
      providerAccountInfo.amount
    } tokens and ${providerBalance / LAMPORTS_PER_SOL} SOL.
    -> Receiver Wallet ${receiver.publicKey} has ${receiverAccountInfo.amount} Tokens and ${
      receiverBalance / LAMPORTS_PER_SOL
    } SOL.`);
  }); */

  async function airdrop(publicKey, amount, provider) {
    await provider.connection
      .requestAirdrop(publicKey, amount * LAMPORTS_PER_SOL)
      .then((sig) => provider.connection.confirmTransaction(sig, "confirmed"));
  }
});
