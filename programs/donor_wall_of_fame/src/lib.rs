use anchor_lang::prelude::*;

declare_id!("65zdg2toqMwqJZBgUUdpLNVZ5hXt2teKesYiVUgQ6g4G");


#[program]
pub mod donor_wall_of_fame {
    use anchor_lang::solana_program::{program::invoke, system_instruction};

    use super::*;

    pub fn create_state_account(
        ctx: Context<CreateStateAccount>, 
        name: String, 
        bump: u8
    ) -> ProgramResult {
        ctx.accounts.state_account.name = name;
        ctx.accounts.state_account.authority = *ctx.accounts.authority.key;
        ctx.accounts.state_account.bump = bump;
        Ok(())
    }

    pub fn create_base_account(
        ctx: Context<CreateBaseAccount>, 
        name: String,
        total_donors: u64
    ) -> ProgramResult {
        msg!("entered create for base_account..");        
        
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
                donor_user_address: *ctx.accounts.user.to_account_info().key,
                donor_name: donor_name,
                donor_twitter_handle: donor_twitter_handle,
                donated_sol: donated_sol,
                donated_token: donated_token_struct
            }
        });
        Ok(())
    }

    pub fn close_account(ctx: Context<CloseAccount>) -> ProgramResult {
        
        let lamports = ctx.accounts.acc_to_close.lamports();

        **ctx
            .accounts
            .acc_to_close
            .to_account_info()
            .try_borrow_mut_lamports()? = 0;

        **ctx.accounts.authority.try_borrow_mut_lamports()? += lamports;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct AddDonor<'info> {
    #[account(
        seeds = [authority.key().as_ref()],
        bump = user.bump,
        has_one = authority,
    )]
    user: Account<'info, StateAccount>,
    #[account(signer)]
    authority: AccountInfo<'info>,
    #[account(mut)]
    base_account: Loader<'info, BaseAccount>,
    pub clock: Sysvar<'info, Clock>
}

#[derive(Accounts)]
#[instruction(name: String, bump: u8)]
pub struct CreateStateAccount<'info> {
    #[account(
        init,
        seeds = [authority.key().as_ref()],
        bump = bump,
        payer = authority,
        space = 320,
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
}

#[derive(Accounts)]
pub struct CreateBaseAccount<'info> {
    #[account(zero)]
    base_account: Loader<'info, BaseAccount>,
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

#[account(zero_copy)]
pub struct BaseAccount {                // 1 complete donation list = 304 + 929 * 1000 bytes
    head: u64,                          // 8 bytes
    tail: u64,                          // 8 bytes
    pub total_donors: u64,              // 8 bytes
    pub name: [u8; 280],                // 280 bytes
    pub donor_list: [DonorStruct; 100]  // 929 bytes * 100 
}

#[derive(Accounts)]
pub struct CloseAccount<'info> {
    #[account(mut)]
    pub authority: AccountInfo<'info>,
    #[account(mut)]
    pub acc_to_close: AccountInfo<'info>,
    pub donor_program: AccountInfo<'info>,
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