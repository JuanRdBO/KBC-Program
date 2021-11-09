const anchor = require('@project-serum/anchor');
const solana = require("@solana/web3.js");

const { LAMPORTS_PER_SOL, SYSVAR_CLOCK_PUBKEY } = solana;
const { Keypair, SystemProgram, PublicKey } = anchor.web3;

const main = async() => {
  console.log("🚀 Starting test...")

  const provider = anchor.Provider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Donorhalloffame;
    
    // Create an account keypair for our program to use.
  const baseAccount = anchor.web3.Keypair.generate();

  /**
   * airdrop - Airdrops SOL to an account.
   *
   * @param {PublicKey} publicKey
   */
   async function airdrop(publicKey) {
    await provider.connection
      .requestAirdrop(publicKey, LAMPORTS_PER_SOL)
      .then((sig) => provider.connection.confirmTransaction(sig, "confirmed"));
  }
  console.log("🌭 Airdropping 1 SOL...")
  await airdrop(baseAccount.publicKey);

  // Call start_stuff_off, pass it the params it needs!
  let tx = await program.rpc.entryPoint({
    accounts: {
      baseAccount: baseAccount.publicKey,
      user: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    },
    signers: [baseAccount],
  });

  console.log("📝 Your transaction signature", tx);

  // Fetch data from the account.
  let account = await program.account.baseAccount.fetch(baseAccount.publicKey);
  console.log('👀 Donor Count', account.totalDonors.toString())
    
  let random_nft = new anchor.web3.PublicKey("6b8ropjXu1tsc6gL6ZpS9XacEvNtoySJ2BCYZTHeVwja")
  let random_nft_2 = new anchor.web3.PublicKey("6b8ropjXu1tsc6gL6ZpS9XacEvNtoySJ2BCYZTHeVwjb")
  // Call add_gif!
  await program.rpc.addDonor(
    "@if__name__main", 
    "Joan Ruiz de Bustillo",
    5,
    random_nft,
    10,
    true,
    "test_arweave_link",
    provider.wallet.publicKey, {
    accounts: {
      baseAccount: baseAccount.publicKey,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY
    },
  });
  
  await program.rpc.addDonor(
    "@if__name__main", 
    "Joan Ruiz de Bustillo",
    10,
    random_nft,
    20,
    true,
    "test_arweave_link",
    provider.wallet.publicKey, {
    accounts: {
      baseAccount: baseAccount.publicKey,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY
    },
  });

  // Get the account again to see what changed.
  account = await program.account.baseAccount.fetch(baseAccount.publicKey);
  console.log('👀 Donor Count', account.totalDonors.toString())

  console.log("👀 Donor List", account.donorList)

  console.log("Donated tokens", account.donorList[0])

  let my_wallet = new PublicKey("juan3uxteK3E4ikyTeAg2AYRKzBS7CJ4dkGmx7zyHMv")
  let my_balance = await provider.connection.getBalance(my_wallet)
  const amount = 1000;
  console.log(`💰 Initial wallet balance ${my_wallet}: ${my_balance} lamports`)
  console.log(`💸 Transfering ${amount} lamports from ${my_wallet} to ${provider.wallet.publicKey}...`)

  await program.rpc.sendSol(
    new anchor.BN(amount), {
    accounts: {
      from: provider.wallet.publicKey,
      to: my_wallet,
      systemProgram: SystemProgram.programId,
    }
  });

  my_balance = await provider.connection.getBalance(my_wallet)
  console.log(`💰 Final wallet balance ${my_wallet}: ${my_balance}`)

}

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMain();