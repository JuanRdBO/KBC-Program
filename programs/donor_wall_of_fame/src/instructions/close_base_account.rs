
use anchor_lang::prelude::*;

use crate::state::*;

pub fn handler(ctx: Context<CloseBaseAccount>) -> ProgramResult {
        
    msg!("Closing a base_account...");

    /* Alternative way to close an account:       

    let lamports = ctx.accounts.acc_to_close.lamports();

    **ctx
        .accounts
        .acc_to_close
        .to_account_info()
        .try_borrow_mut_lamports()? = 0;

    **ctx.accounts.authority.try_borrow_mut_lamports()? += lamports; */

    Ok(())
}

#[derive(Accounts)]
pub struct CloseBaseAccount<'info> {
    #[account(mut)]
    pub authority: AccountInfo<'info>,
    #[account(mut)]
    pub state_account: Account<'info, StateAccount>,
    #[account(
        mut,
        constraint = state_account.authority == *authority.key,
        close = authority
    )]
    pub acc_to_close: AccountLoader<'info, BaseAccount>,
    pub donor_program: AccountInfo<'info>,
}