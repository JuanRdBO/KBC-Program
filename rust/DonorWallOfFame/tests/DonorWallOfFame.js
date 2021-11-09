const anchor = require('@project-serum/anchor');
const solana = require("@solana/web3.js");
const splToken = require("@solana/spl-token");

const { LAMPORTS_PER_SOL, SYSVAR_CLOCK_PUBKEY } = solana;
const { Keypair, SystemProgram, PublicKey } = anchor.web3;

const kp = {"_keypair":{"publicKey":{"0":13,"1":9,"2":88,"3":118,"4":47,"5":62,"6":139,"7":132,"8":66,"9":107,"10":73,"11":212,"12":150,"13":192,"14":100,"15":60,"16":217,"17":220,"18":245,"19":108,"20":115,"21":249,"22":117,"23":133,"24":246,"25":57,"26":186,"27":133,"28":214,"29":32,"30":106,"31":95},"secretKey":{"0":131,"1":168,"2":158,"3":78,"4":142,"5":172,"6":24,"7":106,"8":74,"9":118,"10":170,"11":201,"12":87,"13":171,"14":140,"15":3,"16":170,"17":221,"18":205,"19":217,"20":139,"21":185,"22":171,"23":179,"24":56,"25":166,"26":62,"27":157,"28":71,"29":5,"30":60,"31":57,"32":13,"33":9,"34":88,"35":118,"36":47,"37":62,"38":139,"39":132,"40":66,"41":107,"42":73,"43":212,"44":150,"45":192,"46":100,"47":60,"48":217,"49":220,"50":245,"51":108,"52":115,"53":249,"54":117,"55":133,"56":246,"57":57,"58":186,"59":133,"60":214,"61":32,"62":106,"63":95}}}

const main = async() => {
  console.log("🚀 Starting test...")

  const provider = anchor.Provider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Donorhalloffame;
    
    // Create an account keypair for our program to use.
  const baseAccount = anchor.web3.Keypair.generate();

  const arr = Object.values(kp._keypair.secretKey)
  const secret = new Uint8Array(arr)
  const user = anchor.web3.Keypair.fromSecretKey(secret)

  const receiver = anchor.web3.Keypair.fromSecretKey(secret)
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
  await airdrop(provider.wallet.publicKey);
  console.log("airdropped")
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

  let my_balance = await provider.connection.getBalance(user.publicKey)
  const amount = 1000;
  console.log(`💰 Initial wallet balance ${user.publicKey}: ${my_balance} lamports`)
  console.log(`💸 Transfering ${amount} lamports from ${provider.wallet.publicKey} to ${user.publicKey}...`)

  await program.rpc.sendSol(
    new anchor.BN(amount), {
    accounts: {
      from: provider.wallet.publicKey,
      to: user.publicKey,
      systemProgram: SystemProgram.programId,
    }
  });

  my_balance = await provider.connection.getBalance(user.publicKey)
  console.log(`💰 Final wallet balance ${user.publicKey}: ${my_balance}`)

  let randomMint = await splToken.Token.createMint(
    provider.connection,
    user,
    user.publicKey,
    null,
    9,
    splToken.TOKEN_PROGRAM_ID,
  );
  console.log(`⌛ Created random Mint ${randomMint.publicKey}`)

  initializeRandomMint = await randomMint.createAccount(
    user.publicKey
  );

  initializeRandomMintOnOtherAccount = await randomMint.createAccount(
    receiver.publicKey
  );
  
  console.log(`⏰ Initialized random MintAccount ${initializeRandomMint}`)

  let mintAmount = 100
  await randomMint.mintTo(
    initializeRandomMint,
    user.publicKey,
    [user],
    mintAmount
  );
  console.log(`⛄ Minted ${mintAmount} tokens to ${user.publicKey}`)
  
  let _randomInfoAccount = await randomMint.getAccountInfo(
    initializeRandomMint
  );
  let _randomInfoAccountOnOtherAccount = await randomMint.getAccountInfo(
    initializeRandomMintOnOtherAccount
  );

  my_balance = await provider.connection.getBalance(user.publicKey)
  console.log(`⛽ Test passed: Account ${initializeRandomMint} has  ${_randomInfoAccount.amount} tokens and ${my_balance/ LAMPORTS_PER_SOL} SOL. 
            Other Account ${initializeRandomMintOnOtherAccount} has ${_randomInfoAccountOnOtherAccount.amount} Tokens`)

  const [_pda, _nonce] = await PublicKey.findProgramAddress(
    [Buffer.from(anchor.utils.bytes.utf8.encode("donor"))],
    program.programId
  );

  console.log("Bump is ", _nonce)

/*   // Check that the new owner is the PDA.
  assert.ok(_randomInfoAccount.owner.equals(pda)); */

  await program.rpc.sendSpl(
    new anchor.BN(15), {
    accounts: {
      from: user.publicKey, // user from pubkey
      fromAccount: initializeRandomMint, // user from account
      to: receiver.publicKey, // receiver to pubkey
      toAccount: initializeRandomMintOnOtherAccount, // receiver to account
      pdaAccount: _pda,
      tokenProgram: splToken.TOKEN_PROGRAM_ID,
    },
    signers: [user]
  });

  _randomInfoAccountOnOtherAccount = await randomMint.getAccountInfo(
    initializeRandomMintOnOtherAccount
  );
  my_balance = await provider.connection.getBalance(user.publicKey)
  console.log(`⛳ SPL token transfer passed! Account ${initializeRandomMint} has  ${_randomInfoAccount.amount} tokens and ${my_balance/ LAMPORTS_PER_SOL} SOL. 
            Other Account ${initializeRandomMintOnOtherAccount} has ${_randomInfoAccountOnOtherAccount.amount} Tokens`)


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