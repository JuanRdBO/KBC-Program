const anchor = require("@project-serum/anchor");
const assert = require("assert");
const solana = require("@solana/web3.js");
const splToken = require("@solana/spl-token");
const { BN } = require("bn.js");

const { LAMPORTS_PER_SOL, SYSVAR_CLOCK_PUBKEY } = solana;
const { Keypair, SystemProgram, PublicKey } = anchor.web3;

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

describe("simulate normal donor flow", () => {
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
    /*     let airdrop_amount = 5;
    console.log("🌭 Airdropping", airdrop_amount, "SOL to user wallet...");
    await airdrop(program.provider.wallet.publicKey, airdrop_amount, provider); */

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
    await airdrop(user.publicKey, 5, provider);
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

  it("Random guy adds donors (donates some SOL)", async () => {
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
    await program.rpc.addSolDonor(
      "@if__name__main",
      "Juan Ruiz de Bustillo",
      new BN(LAMPORTS_PER_SOL),
      new BN(0),
      kekwCoin, // he it would be SOL mint
      new BN(0),
      false,
      "_",
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

  it("Random guy adds donors (donates some KEKW)", async () => {
    const authorityKeypair = Keypair.generate();

    await airdrop(authorityKeypair.publicKey, 1, provider);
    await airdrop(receiver.publicKey, 1, provider);

    const authority = authorityKeypair.publicKey;
    const stateAccount = (
      await PublicKey.findProgramAddress([program.provider.wallet.publicKey.toBuffer()], program.programId)
    )[0];

    // *************
    // creates mint
    // *************
    let kekwCoin = await splToken.Token.createMint(
      provider.connection,
      authorityKeypair,
      authorityKeypair.publicKey,
      null,
      0,
      splToken.TOKEN_PROGRAM_ID
    );
    console.log(`⌛ Created random Mint ${kekwCoin.publicKey}`);

    // initializing the account for both sender and receiver
    providerWalletTokenAccount = await (
      await kekwCoin.getOrCreateAssociatedAccountInfo(authorityKeypair.publicKey)
    ).address;

    // mint 100 tokens to the receiver address
    let mintAmount = 100;
    await kekwCoin.mintTo(providerWalletTokenAccount, authorityKeypair.publicKey, [authorityKeypair], mintAmount);

    receiverWalletTokenAccount = await (await kekwCoin.getOrCreateAssociatedAccountInfo(receiver.publicKey)).address;

    console.log(
      `⏰ Initialized random MintAccount on provider: ${providerWalletTokenAccount} and on receiver: ${receiverWalletTokenAccount}`
    );

    console.log(`⛄ Minted ${mintAmount} tokens to ${receiver.publicKey}`);

    // Get account info about SPL token wallet balances
    let providerAccountInfo = await kekwCoin.getAccountInfo(providerWalletTokenAccount);
    let receiverAccountInfo = await kekwCoin.getAccountInfo(receiverWalletTokenAccount);

    let providerBalance = await provider.connection.getBalance(authorityKeypair.publicKey);
    let receiverBalance = await provider.connection.getBalance(receiver.publicKey);
    console.log(`⛽  -> Provider wallet ${authorityKeypair.publicKey} has ${providerAccountInfo.amount} tokens and ${
      providerBalance / LAMPORTS_PER_SOL
    } SOL.
    -> Receiver Wallet ${receiver.publicKey} has ${receiverAccountInfo.amount} Tokens and ${
      receiverBalance / LAMPORTS_PER_SOL
    } SOL.`);
    // ****************
    0;
    console.log("Adding a new donation...");
    await program.rpc.addSplDonor(
      "@if__name__main",
      "Juan Ruiz de Bustillo",
      new BN(0),
      new BN(0),
      kekwCoin.publicKey, // he it would be SOL mint
      new BN(20),
      false,
      "_",
      {
        accounts: {
          stateAccount,
          authority,
          baseAccount: baseAccount.publicKey,
          donationTreasury: receiver.publicKey,
          receiverTokenAccount: receiverWalletTokenAccount,
          providerTokenAccount: providerWalletTokenAccount,
          systemProgram: SystemProgram.programId,
          tokenProgram: splToken.TOKEN_PROGRAM_ID,
        },
        signers: [authorityKeypair],
      }
    );

    // balance after
    providerAccountInfo = await kekwCoin.getAccountInfo(providerWalletTokenAccount);
    receiverAccountInfo = await kekwCoin.getAccountInfo(receiverWalletTokenAccount);

    providerBalance = await provider.connection.getBalance(authorityKeypair.publicKey);
    receiverBalance = await provider.connection.getBalance(receiver.publicKey);
    console.log(`⛽  -> Provider wallet ${authorityKeypair.publicKey} has ${providerAccountInfo.amount} tokens and ${
      providerBalance / LAMPORTS_PER_SOL
    } SOL.
    -> Receiver Wallet ${receiver.publicKey} has ${receiverAccountInfo.amount} Tokens and ${
      receiverBalance / LAMPORTS_PER_SOL
    } SOL.`);

    // Check the donor list state is as expected.
    const donorList = await program.account.baseAccount.fetch(baseAccount.publicKey);
    const name = new TextDecoder("utf-8").decode(new Uint8Array(donorList.name));
    console.log("DonationList name is " + name);
    assert.ok(name.startsWith("KBC donation list")); // [u8; 280] => trailing zeros.
  });
});

describe("****************************\n    Error robustness tests\n  ****************************", () => {
  it("Random guy donates 0 SOL (should fail)", async () => {
    const authorityKeypair = Keypair.generate();

    await airdrop(authorityKeypair.publicKey, 5, provider);

    const authority = authorityKeypair.publicKey;
    const stateAccount = (
      await PublicKey.findProgramAddress([program.provider.wallet.publicKey.toBuffer()], program.programId)
    )[0];

    console.log("Adding a new donation...");
    let kekwCoin = new PublicKey("2QK9vxydd7WoDwvVFT5JSU8cwE9xmbJSzeqbRESiPGMG");

    await assert.rejects(
      async () => {
        await program.rpc.addSolDonor(
          "@if__name__main",
          "Juan Ruiz de Bustillo",
          new BN(0),
          new BN(0),
          kekwCoin, // he it would be SOL mint
          new BN(0),
          false,
          "_",
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
      },
      (err) => {
        assert.strictEqual(err.message, `301: The donated amount must be bigger than 0!`);
        return true;
      }
    );
  });
  it("Random guy donates SOL, but wants to assign someone else as donor (should fail)", async () => {
    const authorityKeypair = Keypair.generate();
    const otherRandomGuy = Keypair.generate();

    await airdrop(authorityKeypair.publicKey, 5, provider);

    const authority = authorityKeypair.publicKey;
    const stateAccount = (
      await PublicKey.findProgramAddress([program.provider.wallet.publicKey.toBuffer()], program.programId)
    )[0];

    console.log("Adding a new donation...");
    let kekwCoin = new PublicKey("2QK9vxydd7WoDwvVFT5JSU8cwE9xmbJSzeqbRESiPGMG");

    await assert.rejects(
      async () => {
        await program.rpc.addSolDonor(
          "@if__name__main",
          "Juan Ruiz de Bustillo",
          new BN(LAMPORTS_PER_SOL),
          new BN(0),
          kekwCoin, // he it would be SOL mint
          new BN(0),
          false,
          "_",
          {
            accounts: {
              stateAccount,
              authority: otherRandomGuy.publicKey,
              baseAccount: baseAccount.publicKey,
              donationTreasury: receiver.publicKey,
              clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
              systemProgram: SystemProgram.programId,
            },
            signers: [authorityKeypair],
          }
        );
      },
      (err) => {
        assert.strictEqual(err.message, `unknown signer: ${authorityKeypair.publicKey.toBase58()}`);
        return true;
      }
    );
  });
});

describe("******************\n    closes accounts\n  ******************", () => {
  it("Random guy wants to close state account (should fail)", async () => {
    const auth_kp = anchor.web3.Keypair.generate();
    const authority = auth_kp.publicKey;

    const [stateAccount, bump] = await PublicKey.findProgramAddress([authority.toBuffer()], program.programId);

    await assert.rejects(
      async () => {
        await program.rpc.closeStateAccount({
          accounts: {
            authority: authority,
            stateAccount: stateAccount,
            donorProgram: program.programId,
          },
          signers: [auth_kp],
        });
      },
      (err) => {
        assert.strictEqual(err.message, `unknown signer: ${authority.toBase58()}`);
        return true;
      }
    );
  });
  it("Random guy wants to close base account (should fail)", async () => {
    const auth_kp = anchor.web3.Keypair.generate();
    const authority = auth_kp.publicKey;

    const [stateAccount, bump] = await PublicKey.findProgramAddress([authority.toBuffer()], program.programId);

    await assert.rejects(
      async () => {
        await program.rpc.closeBaseAccount({
          accounts: {
            authority: authority,
            stateAccount: stateAccount,
            accToClose: baseAccount.publicKey,
            donorProgram: program.programId,
          },
          signers: [auth_kp],
        });
      },
      (err) => {
        assert.strictEqual(err.message, `unknown signer: ${authority.toBase58()}`);
        return true;
      }
    );
  });

  it("Admin closes base account", async () => {
    const authority = program.provider.wallet.publicKey;

    let UserAccountBalance = await program.provider.connection.getBalance(authority);
    console.log("UserAccount has " + UserAccountBalance / LAMPORTS_PER_SOL + " SOL.");

    let baseAccountBalance = await program.provider.connection.getBalance(baseAccount.publicKey);
    console.log("BaseAccount has " + baseAccountBalance / LAMPORTS_PER_SOL + " SOL.");

    const [stateAccount, bump] = await PublicKey.findProgramAddress([authority.toBuffer()], program.programId);

    await program.rpc.closeBaseAccount({
      accounts: {
        authority: authority,
        stateAccount: stateAccount,
        accToClose: baseAccount.publicKey,
        donorProgram: program.programId,
      },
    });

    console.log("BaseAccount closed!");

    UserAccountBalance = await program.provider.connection.getBalance(authority);
    console.log("UserAccount has " + UserAccountBalance / LAMPORTS_PER_SOL + " SOL.");

    baseAccountBalance = await program.provider.connection.getBalance(baseAccount.publicKey);
    console.log("BaseAccount has " + baseAccountBalance / LAMPORTS_PER_SOL + " SOL.");
  });

  it("Admin closes state account", async () => {
    const authority = program.provider.wallet.publicKey;

    let UserAccountBalance = await program.provider.connection.getBalance(authority);
    console.log("UserAccount has " + UserAccountBalance / LAMPORTS_PER_SOL + " SOL.");

    let baseAccountBalance = await program.provider.connection.getBalance(baseAccount.publicKey);
    console.log("BaseAccount has " + baseAccountBalance / LAMPORTS_PER_SOL + " SOL.");

    const [stateAccount, bump] = await PublicKey.findProgramAddress([authority.toBuffer()], program.programId);

    await program.rpc.closeStateAccount({
      accounts: {
        authority: authority,
        stateAccount: stateAccount,
        donorProgram: program.programId,
      },
    });

    console.log("StateAccount closed!");

    UserAccountBalance = await program.provider.connection.getBalance(authority);
    console.log("UserAccount has " + UserAccountBalance / LAMPORTS_PER_SOL + " SOL.");

    baseAccountBalance = await program.provider.connection.getBalance(baseAccount.publicKey);
    console.log("BaseAccount has " + baseAccountBalance / LAMPORTS_PER_SOL + " SOL.");
  });
});

async function airdrop(publicKey, amount, provider) {
  var retryLatency = 500;
  retries = 5;

  for (let i = 0; i < retries; i++) {
    try {
      await provider.connection
        .requestAirdrop(publicKey, amount * LAMPORTS_PER_SOL)
        .then((sig) => provider.connection.confirmTransaction(sig, "confirmed"));
      break;
    } catch (e) {
      console.log("Error on airdrop. Retrying...");
      await new Promise((resolve) => setTimeout(resolve, retryLatency));
      retryLatency += 2000;
    }
  }
}
