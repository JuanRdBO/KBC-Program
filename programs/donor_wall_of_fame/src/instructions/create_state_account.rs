use anchor_lang::prelude::*;


pub fn handler(
    ctx: Context<CreateStateAccount>, 
    name: String, 
    donation_treasury: Pubkey,
    bump: u8
) -> ProgramResult {

    msg!("Creating a new state_account..");        
    
    ctx.accounts.state_account.name = name;
    ctx.accounts.state_account.authority = *ctx.accounts.authority.key;
    ctx.accounts.state_account.bump = bump;
    ctx.accounts.state_account.donation_treasury = donation_treasury.key();
    ctx.accounts.state_account.total_donor_lists = 0;
    Ok(())
}

#[derive(Accounts)]
#[instruction(name: String, donation_treasury: Pubkey, bump: u8)]
pub struct CreateStateAccount<'info> {
    #[account(
        init,
        seeds = [authority.key().as_ref()],
        bump = bump,
        payer = authority,
        space = 5000,     // Each State Account can hold ~150 list references and costs 0.03 SOL
    )]
    state_account: Account<'info, StateAccount>,
    #[account(signer)]
    authority: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
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