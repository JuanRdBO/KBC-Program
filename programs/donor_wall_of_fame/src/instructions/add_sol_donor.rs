use anchor_lang::prelude::*;
use crate::{StateAccount, BaseAccount, DonatedTokens, DonorStruct};

pub fn handler(
    ctx: Context<AddSOLDonor>,
    donor_twitter_handle: String, 
    donor_name: String, 
    donated_sol: u64,
    donated_usdc: u64,
    donated_token: Pubkey,
    donated_amount: u64,
    is_nft: bool,
    arweave_link: String,
    sol_amount: u64,
) -> ProgramResult {
    let mut base_account = ctx.accounts.base_account.load_mut()?;
    let timestamp = ctx.accounts.clock.unix_timestamp;

    msg!("Sending some SOL...");

    let ix = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.authority.key(),
        &ctx.accounts.donation_treasury.key(),
        sol_amount,
    );
    anchor_lang::solana_program::program::invoke(
        &ix,
        &[
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.donation_treasury.to_account_info(),
        ],
    )?;

    base_account.append({

        // encode Twttr handle to bytes
        let given_donor_twitter_handle = donor_twitter_handle.as_bytes();
        let mut donor_twitter_handle = [0u8; 280];
        donor_twitter_handle[..given_donor_twitter_handle.len()].copy_from_slice(given_donor_twitter_handle);

        // encode name to bytes
        let given_donor_name = donor_name.as_bytes();
        let mut donor_name = [0u8; 280];
        donor_name[..given_donor_name.len()].copy_from_slice(given_donor_name);

        // encode arweave_link to bytes
        let given_arweave_link = arweave_link.as_bytes();
        let mut arweave_link = [0u8; 280];
        arweave_link[..given_arweave_link.len()].copy_from_slice(given_arweave_link);

        // build token struct
        let donated_token_struct = DonatedTokens{
            donated_token: donated_token,
            donated_amount: donated_amount,
            timestamp: timestamp,
            is_nft: is_nft,
            arweave_link: arweave_link
        };

        DonorStruct {
            donor_user_address: *ctx.accounts.state_account.to_account_info().key,
            donor_name: donor_name,
            donor_twitter_handle: donor_twitter_handle,
            donated_sol: donated_sol,
            donated_usdc: donated_usdc,
            donated_token: donated_token_struct
        }
    });
    Ok(())
}



#[derive(Accounts)]
pub struct AddSOLDonor<'info> {
    #[account(mut)]
    state_account: Account<'info, StateAccount>, // this is a pda of the authority (provider wallet)
    #[account(mut)]
    authority: Signer<'info>,
    #[account(mut)]
    base_account: AccountLoader<'info, BaseAccount>,
    #[account(mut)]
    donation_treasury: AccountInfo<'info>,
    pub clock: Sysvar<'info, Clock>,
    system_program: Program<'info, System>
}