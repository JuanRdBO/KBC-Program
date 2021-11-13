use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Transfer};

use anchor_spl::token;

declare_id!("6HSmobk9iVpjkBZiv59hb97X2upZoPsc8EieWgrTqyuA");

const DONOR_PDA_SEED: &[u8] = b"donor";

#[program]
pub mod donor_wall_of_fame {

    use super::*;

    pub fn create_state_account(
        ctx: Context<CreateStateAccount>, 
        name: String, 
        bump: u8
    ) -> ProgramResult {

        msg!("Creating a new state_account..");        
        
        ctx.accounts.state_account.name = name;
        ctx.accounts.state_account.authority = *ctx.accounts.authority.key;
        ctx.accounts.state_account.bump = bump;
        ctx.accounts.state_account.total_donor_lists = 0;
        Ok(())
    }
    
    pub fn add_donation_list(
        ctx: Context<AddDonationList>,
        donation_list: Pubkey
    ) -> ProgramResult {
        let state_account = &mut ctx.accounts.state_account;

        msg!("Adding a new donation list to state_account...");

        // Pushes new list into donation list record
        state_account.donor_lists.push(donation_list);
        state_account.total_donor_lists += 1;

        Ok(())
    }

    pub fn create_base_account(
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

    pub fn add_donor(
        ctx: Context<AddDonor>,
        donor_twitter_handle: String, 
        donor_name: String, 
        donated_sol: u64,
        donated_token: Pubkey,
        donated_amount: u64,
        is_nft: bool,
        arweave_link: String,
    ) -> ProgramResult {
        let mut base_account = ctx.accounts.base_account.load_mut()?;
        let timestamp = ctx.accounts.clock.unix_timestamp;

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
                donated_token: donated_token_struct
            }
        });
        Ok(())
    }

    pub fn close_base_account(ctx: Context<CloseBaseAccount>) -> ProgramResult {
        
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
    
    pub fn send_spl(ctx: Context<SendSpl>, amount: u64) -> ProgramResult {

        msg!("Sending some SPL tokens...");

        // Transferring from initializer to taker
        let (_pda, bump_seed) = Pubkey::find_program_address(&[DONOR_PDA_SEED], ctx.program_id);
        let seeds = &[&DONOR_PDA_SEED[..], &[bump_seed]];

        token::transfer(
            ctx.accounts
                .into_transfer_to_taker_context()
                .with_signer(&[&seeds[..]]),
            amount,
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct AddDonor<'info> {
    #[account(
        seeds = [authority.key().as_ref()],
        bump = state_account.bump,
        has_one = authority,
    )]
    state_account: Account<'info, StateAccount>, // this is a pda of the authority (provider wallet)
    #[account(signer)]
    authority: AccountInfo<'info>,
    #[account(mut)]
    base_account: AccountLoader<'info, BaseAccount>,
    pub clock: Sysvar<'info, Clock>
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

#[derive(Accounts)]
#[instruction(name: String, bump: u8)]
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
    bump: u8,
    total_donor_lists: u8,
    donor_lists: Vec<Pubkey> // Each State Account can hold ~100 list references
}

#[derive(Accounts)]
pub struct CreateBaseAccount<'info> {
    #[account(zero)]
    base_account: AccountLoader<'info, BaseAccount>,
}

#[derive(Accounts)]
pub struct CloseBaseAccount<'info> {
    #[account(mut)]
    pub authority: AccountInfo<'info>,
    #[account(mut, close = authority)]
    pub acc_to_close: AccountLoader<'info, BaseAccount>,
    pub donor_program: AccountInfo<'info>,
}

#[account(zero_copy)]
pub struct BaseAccount {                // 1 complete donation list = 304 + 929 * 1000 bytes
    head: u64,                          // 8 bytes
    tail: u64,                          // 8 bytes
    pub total_donors: u64,              // 8 bytes
    pub name: [u8; 280],                // 280 bytes
    pub space: u64,
    pub donor_list: [DonorStruct; 100]  // 929 bytes * 100 
}

#[zero_copy]    
pub struct DonorStruct {                // 1 complete struct = 929 bytes
    pub donor_twitter_handle: [u8; 280],// 1byte * 280
    pub donor_name: [u8; 280],          // 1byte * 280
    pub donated_sol: u64,               // 8bytes
    pub donor_user_address: Pubkey,     // 32 bytes
    pub donated_token: DonatedTokens    // 329 bytes
}

#[zero_copy]
pub struct DonatedTokens {              // 1 complete struct = 329 bytes
    pub donated_token: Pubkey,          // 32 bytes
    pub donated_amount: u64,            // 8 bytes
    pub timestamp: i64,                 // 8 bytes
    pub is_nft: bool,                   // 1 byte
    pub arweave_link: [u8; 280],        // 1 byte * 280
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
pub struct SendSpl<'info> {
    #[account(mut)]
    from: Signer<'info>,
    #[account(mut)]
    from_account: Account<'info, TokenAccount>,
    #[account(mut)]
    to: AccountInfo<'info>,
    #[account(mut)]
    to_account: Account<'info, TokenAccount>,
    #[account(seeds=[b"donor".as_ref()], bump)]
    pda_account: AccountInfo<'info>,
    token_program: Program<'info, Token>
}

impl<'info> SendSpl<'info> {
    fn into_transfer_to_taker_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.from_account.to_account_info().clone(),
            to: self.to_account.to_account_info().clone(),
            authority: self.from.to_account_info().clone(),
        };
        let cpi_program = self.token_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }
}

impl BaseAccount {
    fn append(&mut self, donor_list_in: DonorStruct) {
        self.donor_list[BaseAccount::index_of(self.head)] = donor_list_in;
        if BaseAccount::index_of(self.head + 1) == BaseAccount::index_of(self.tail) {
            self.tail += 1;
        }
        self.head += 1;
    }
    fn index_of(counter: u64) -> usize {
        std::convert::TryInto::try_into(counter % 100).unwrap()
    }
}

#[error]
pub enum ErrorCode {
    #[msg("Not authorized!")]
    NotAuthorized
}