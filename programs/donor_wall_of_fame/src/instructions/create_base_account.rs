
use anchor_lang::prelude::*;

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

#[account(zero_copy)]
pub struct BaseAccount {                // 1 complete donation list = 304 + 929 * 1000 bytes
    head: u64,                          // 8 bytes
    tail: u64,                          // 8 bytes
    pub total_donors: u64,              // 8 bytes
    pub name: [u8; 280],                // 280 bytes
    pub space: u64,
    pub donor_list: [DonorStruct; 1000]  // 937 bytes * 1000 
}


#[zero_copy]    
pub struct DonorStruct {                // 1 complete struct = 937 bytes
    pub donor_twitter_handle: [u8; 280],// 1byte * 280
    pub donor_name: [u8; 280],          // 1byte * 280
    pub donated_sol: u64,               // 8bytes
    pub donated_usdc: u64,              // 8bytes
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