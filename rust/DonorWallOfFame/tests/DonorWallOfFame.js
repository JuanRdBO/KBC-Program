const anchor = require('@project-serum/anchor');
const { PublicKey } = require('@solana/web3.js');


// Need the system program, will talk about this soon.
const { SystemProgram } = anchor.web3;

const main = async() => {
  console.log("🚀 Starting test...")

  const provider = anchor.Provider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Donorhalloffame;
    
    // Create an account keypair for our program to use.
  const baseAccount = anchor.web3.Keypair.generate();

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
    provider.wallet.publicKey, {
    accounts: {
      baseAccount: baseAccount.publicKey,
    },
  });
  
  await program.rpc.addDonor(
    "@if__name__main", 
    "Joan Ruiz de Bustillo",
    10,
    random_nft,
    20,
    provider.wallet.publicKey, {
    accounts: {
      baseAccount: baseAccount.publicKey,
    },
  });

  // Get the account again to see what changed.
  account = await program.account.baseAccount.fetch(baseAccount.publicKey);
  console.log('👀 Donor Count', account.totalDonors.toString())

  console.log("👀 Donor List", account.donorList)

  console.log("Donated tokens", account.donorList[0])

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