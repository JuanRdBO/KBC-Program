
use anchor_lang::prelude::*;
use crate::BaseAccount;

pub fn handler(
    ctx: Context<CreateBaseAccount>, 
    name: String,
    total_donors: u64
) -> ProgramResult {

    msg!("Creating a new base_account..");        
    
    let given_name = name.as_bytes();
    let mut name = [0u8; 280];
    name[..given_name.len()].copy_from_slice(given_name);

    let mut chat = ctx.accounts.base_account.load_init()?;
    chat.name = name;
    chat.total_donors = total_donors;
    Ok(())
}


#[derive(Accounts)]
pub struct CreateBaseAccount<'info> {
    #[account(zero)]
    base_account: AccountLoader<'info, BaseAccount>,
}

