
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction, TransactionInstruction } from "@solana/web3.js";
import { Token, TOKEN_PROGRAM_ID, u64, MintInfo, MintLayout } from '@solana/spl-token'
import { sendTransactionWithRetry } from "./connection"
import { useState } from "react";
import { Wallet } from "@solana/wallet-adapter-wallets";

export async function sendDonation(
    connection: Connection,
    wallet: any,
    fromPubkey: PublicKey,
    toPubkey: PublicKey,
    quantity: number,
    mintAddress: string,
    isSol: boolean
) {
    let outcome = false
    let tx = "" as any
    let err = "" as any
    const signers: Keypair[] = []

    const instructions: TransactionInstruction[] = [];


    if (isSol) {

        const lamports = LAMPORTS_PER_SOL * quantity

        console.log("SENDING SOL")
        // SEND SOL
        instructions.push(
            SystemProgram.transfer({
                fromPubkey,
                toPubkey,
                lamports,
            })
        )
        try {
            const { txid } = await sendTransactionWithRetry(
                connection,
                wallet,
                instructions,
                signers,
                'single',
            );            

            console.log(`SENT ${quantity} SOL FROM ${fromPubkey.toBase58()} to ${toPubkey.toBase58()}`)

            outcome = true
            tx = txid

        } catch (e) {
            console.error(`TX failed ${e}`);
            err = e
        }

    } else {
        console.log("SENDING SPL TOKEN")

        const accInfo =  await connection.getAccountInfo(toPublicKey(mintAddress))
        if (accInfo === null) {
          throw new Error('Failed to find mint account');
        }

        const buffData = Buffer.from(accInfo.data)

        const mintInto = deserializeMint(buffData)

        /* console.log("MINTINFO", mintInto) */

        const lamports = Math.pow(10, mintInto.decimals) * quantity

        // SEND SPL TOKEN
        const fromAta = await getOrCreateAta(
            mintAddress,
            fromPubkey.toBase58(),
            connection,
            wallet
        );
        const fromTokenAccount = fromAta.ataPubKey
        /* const fromInstructions = fromAta.instructions
        
        instructions.push(
            ...fromInstructions
        ) */

        //get the token account of the toWallet Solana address, if it does not exist, create it
        const toAta = await getOrCreateAta(
            mintAddress,
            toPubkey.toBase58(),
            connection,
            wallet
        );
        const toTokenAccount = toAta.ataPubKey
        const toInstructions = toAta.instructions
        
        instructions.push(
            ...toInstructions
        )

        instructions.push(
            Token.createTransferInstruction(
                TOKEN_PROGRAM_ID,
                fromTokenAccount,
                toTokenAccount,
                fromPubkey,
                [],
                lamports,
            ),
        );

        try {
            const { txid } = await sendTransactionWithRetry(
                connection,
                wallet,
                instructions,
                signers,
                'single',
            );            

            console.log(`SENT ${quantity} ${mintAddress} FROM ${fromPubkey.toBase58()} to ${toPubkey.toBase58()}`)

            outcome = true
            tx = txid

        } catch (e) {
            console.error(`TX failed ${e}`);
            err = e
        }
    }

    return {tx, outcome, err}
}

export async function getOrCreateAta(tokenmintAddress: string, signerPubKeyAddress: string, connection: Connection, fromWallet: any) {

    const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey(
        'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
    );

    // if alternative currency is set, go for it
    const tokenMint = new PublicKey(tokenmintAddress);
    const ata = (
        await PublicKey.findProgramAddress(
            [
                toPublicKey(signerPubKeyAddress).toBuffer(),
                TOKEN_PROGRAM_ID.toBuffer(),
                tokenMint.toBuffer(),
            ],
            SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
        )
    )[0];
    const signers: Keypair[] = []
    var instructions: TransactionInstruction[] = [];

    const existingAta = await connection.getAccountInfo(ata);

    // create a new ATA if there is none
    console.log('Looking for existing ata?', existingAta);
    if (!existingAta) {
        instructions.push(
                createAssociatedTokenAccountInstruction(
                instructions,
                toPublicKey(ata),
                toPublicKey(fromWallet.publicKey),
                toPublicKey(signerPubKeyAddress),
                tokenMint,
            )
        )
    }

    const ataPubKey = new PublicKey(ata)

    return {ataPubKey, instructions}
}

const PubKeysInternedMap = new Map<string, PublicKey>();

export const toPublicKey = (key: string | PublicKey) => {
    if (typeof key !== 'string') {
        return key;
    }

    let result = PubKeysInternedMap.get(key);
    if (!result) {
        result = new PublicKey(key);
        PubKeysInternedMap.set(key, result);
    }

    return result;
};

export function createAssociatedTokenAccountInstruction(
    instructions: TransactionInstruction[],
    associatedTokenAddress: PublicKey,
    payer: PublicKey,
    walletAddress: PublicKey,
    splTokenMintAddress: PublicKey,
) {
    const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey(
        'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
    );
    const keys = [
        {
            pubkey: payer,
            isSigner: true,
            isWritable: true,
        },
        {
            pubkey: associatedTokenAddress,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: walletAddress,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: splTokenMintAddress,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: TOKEN_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: SYSVAR_RENT_PUBKEY,
            isSigner: false,
            isWritable: false,
        },
    ];
    return (
        new TransactionInstruction({
            keys,
            programId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
            data: Buffer.from([]),
        })
    )
}
  
export const deserializeMint = (data: Buffer) => {
    if (data.length !== MintLayout.span) {
      throw new Error('Not a valid Mint');
    }
  
    const mintInfo = MintLayout.decode(data);
  
    if (mintInfo.mintAuthorityOption === 0) {
      mintInfo.mintAuthority = null;
    } else {
      mintInfo.mintAuthority = new PublicKey(mintInfo.mintAuthority);
    }
  
    mintInfo.supply = u64.fromBuffer(mintInfo.supply);
    mintInfo.isInitialized = mintInfo.isInitialized !== 0;
  
    if (mintInfo.freezeAuthorityOption === 0) {
      mintInfo.freezeAuthority = null;
    } else {
      mintInfo.freezeAuthority = new PublicKey(mintInfo.freezeAuthority);
    }
  
    return mintInfo as MintInfo;
  };