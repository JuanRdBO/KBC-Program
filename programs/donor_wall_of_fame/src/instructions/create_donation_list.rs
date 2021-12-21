use anchor_lang::prelude::*;

use crate::state::ErrorCode;

pub fn handler(
    ctx: Context<AddDonationList>,
    donation_list: Pubkey
) -> ProgramResult {
    let state_account = &mut ctx.accounts.state_account;

    if state_account.authority.key() != ctx.accounts.authority.key() {
        return Err(ErrorCode::AuthDonationListErr.into());
    }

    msg!("Adding a new donation list to state_account...");

    // Pushes new list into donation list record
    state_account.donor_lists.push(donation_list);
    state_account.total_donor_lists += 1;

    Ok(())
}


#[derive(Accounts)]
pub struct AddDonationList<'info> {
    #[account(
        mut,
        seeds = [authority.key().as_ref()],
        bump = state_account.bump,
        has_one = authority,
    )]
    state_account: Account<'info, StateAccount>, // this is a pda of the authority (provider wallet)
    #[account(signer)]
    authority: AccountInfo<'info>
}

#[account]
pub struct StateAccount {
    name: String,
    authority: Pubkey,
    donation_treasury: Pubkey,
    bump: u8,
    total_donor_lists: u8,
    donor_lists: Vec<Pubkey> // Each State Account can hold ~100 list references
}