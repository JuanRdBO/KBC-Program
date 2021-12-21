use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;

use instructions::*;
use state::{StateAccount, BaseAccount, DonatedTokens, DonorStruct};

declare_id!("2fNH7WXYfHdsZ52bshh85oXwg9FtEcNKVmV9fx2fvndx");

#[program]
pub mod donor_wall_of_fame {
    use super::*;

    pub fn create_state_account(
        ctx: Context<CreateStateAccount>, 
        name: String, 
        donation_treasury: Pubkey,
        bump: u8
    ) -> ProgramResult {
        instructions::create_state_account::handler(ctx, name, donation_treasury, bump)
    }
    
    pub fn add_donation_list(
        ctx: Context<AddDonationList>,
        donation_list: Pubkey
    ) -> ProgramResult {
        instructions::create_donation_list::handler(ctx, donation_list)
    }

    pub fn create_base_account(
        ctx: Context<CreateBaseAccount>, 
        name: String,
        total_donors: u64
    ) -> ProgramResult {

        instructions::create_base_account::handler(ctx, name, total_donors)
    }

    pub fn add_sol_donor(
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
        instructions::add_sol_donor::handler(ctx, donor_twitter_handle, donor_name, donated_sol, donated_usdc, donated_token, donated_amount, is_nft, arweave_link, sol_amount)
    }

    pub fn add_spl_donor(
        ctx: Context<AddSPLDonor>,
        donor_twitter_handle: String, 
        donor_name: String, 
        donated_sol: u64,
        donated_usdc: u64,
        donated_token: Pubkey,
        donated_amount: u64,
        is_nft: bool,
        arweave_link: String,
        spl_token_amount: u64,
    ) -> ProgramResult {
        instructions::add_spl_donor::handler(ctx, donor_twitter_handle, donor_name, donated_sol, donated_usdc, donated_token, donated_amount, is_nft, arweave_link, spl_token_amount)
    }

    pub fn close_base_account(ctx: Context<CloseBaseAccount>) -> ProgramResult {
        instructions::close_base_account::handler(ctx)
    }

}

