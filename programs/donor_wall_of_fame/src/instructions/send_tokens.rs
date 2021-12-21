use anchor_lang::prelude::*;




pub fn send_spl(ctx: Context<SendSPL>, amount: u64) -> ProgramResult {
    token::transfer(ctx.accounts.into(), amount)
}

pub fn send_sol(ctx: Context<SendSol>, amount: u64) -> ProgramResult {

    msg!("Sending some SOL...");

    let ix = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.from.key(),
        &ctx.accounts.to.key(),
        amount,
    );
    anchor_lang::solana_program::program::invoke(
        &ix,
        &[
            ctx.accounts.from.to_account_info(),
            ctx.accounts.to.to_account_info(),
        ],
    )
}    


#[derive(Accounts)]
pub struct SendSol<'info> {
    #[account(mut)]
    from: Signer<'info>,
    #[account(mut)]
    to: AccountInfo<'info>,
    system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct SendSPL<'info> {
    #[account(signer)]
    pub authority: AccountInfo<'info>,
    #[account(mut)]
    pub from: AccountInfo<'info>,
    #[account(mut)]
    pub to: AccountInfo<'info>,
    pub token_program: AccountInfo<'info>,
}
impl<'a, 'b, 'c, 'info> From<&mut SendSPL<'info>>
for CpiContext<'a, 'b, 'c, 'info, Transfer<'info>> {
    fn from(
        accounts: &mut SendSPL<'info>
    ) -> CpiContext<'a, 'b, 'c, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: accounts.from.clone(),
            to: accounts.to.clone(),
            authority: accounts.authority.clone(),
        };
        let cpi_program = accounts.token_program.clone();
        CpiContext::new(cpi_program, cpi_accounts)
    }
}