use anchor_lang::prelude::*;

use crate::state::*;

pub fn handler(_ctx: Context<CloseStateAccount>) -> ProgramResult {
        
    msg!("Closing a state_account...");

    Ok(())
}

#[derive(Accounts)]
pub struct CloseStateAccount<'info> {
    #[account(mut)]
    pub authority: AccountInfo<'info>,
    #[account(
        mut,
        constraint = state_account.authority == *authority.key,
        close = authority
    )]
    pub state_account: Account<'info, StateAccount>,
    pub donor_program: AccountInfo<'info>,
}