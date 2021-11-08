use anchor_lang::prelude::*;

declare_id!("Ay5HUSmsEJNiTuWCN9hr6WDGE5uMkBWwtTXBfRpA8r9q");

#[program]
pub mod donorhalloffame {
  use super::*;
  pub fn entry_point(ctx: Context<EntryPoint>) -> ProgramResult {
    // Get a reference to the account.
    let base_account = &mut ctx.accounts.base_account;
    // Initialize total_gifs.
    base_account.total_donors = 0;
    Ok(())
  }
    // Another function woo!
    pub fn add_donor(
        ctx: Context<AddDonor>, 
        twitter_handle: String, 
        donor_name: String, 
        donated_sol: u32,
        donated_token: Pubkey,
        donated_amount: u32,
        is_nft: bool,
        arweave_link: String,
        user_address: Pubkey,
    ) -> ProgramResult {

        // Get a reference to the account and increment total_gifs.
        let base_account = &mut ctx.accounts.base_account;
        let timestamp = ctx.accounts.clock.unix_timestamp;

        // See if donor already donated
        let mut index = 0;
        let mut index_found = false;
        let user_address_str: String = String::from(user_address.to_string());
        for (i, el) in base_account.donor_list.iter().enumerate() {
            
            if user_address_str.eq(&el.user_address.to_string()) {
                index = i;
                index_found = true;
            }
        };

        let donated_amount_map = DonatedAmount{ 
            timestamp: timestamp, 
            donated_amount: donated_amount,
        };

        // construct the donated tokens object
        let donated_tokens_map = DonatedTokens {
            donated_token: donated_token,
            donated_amount: [donated_amount_map].to_vec(),
            is_nft: is_nft,
            arweave_link: arweave_link,
        };

        if index_found {  // if donor already exists, append to already donated amount

            base_account.donor_list[index].donated_sol += donated_sol;

            if base_account.donor_list[index].donated_tokens.iter().any(|p| p.donated_token == donated_token) {
                // if donor is found, but they donated an already known token, append it to existing amount
                base_account.donor_list[index]
                .donated_tokens[0]
                .donated_amount[0]
                .donated_amount += donated_amount;
            } else {
                // if donor is found, but they donated a new token, push it
                base_account.donor_list[index].donated_tokens.push(donated_tokens_map);
            }

        } else { // if donor does not exist, append it

            // Build the struct.
            let item = DonorStruct {
                twitter_handle: twitter_handle.to_string(),
                donor_name: donor_name.to_string(),
                donated_sol: donated_sol,
                user_address: user_address,
                donated_tokens: [donated_tokens_map].to_vec()
            };
    
            // Add it to the gif_list vector.
            base_account.donor_list.push(item);

        }

        base_account.total_donors += 1;

        Ok(())
    }
}

// Attach certain variables to the StartStuffOff context.
#[derive(Accounts)]
pub struct EntryPoint<'info> {
    #[account(init, payer = user, space = 9000)]
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program <'info, System>
}

// Specify what data you want in the AddGif Context.
// Getting a handle on the flow of things :)?
#[derive(Accounts)]
pub struct AddDonor<'info> {
  #[account(mut)]
  pub base_account: Account<'info, BaseAccount>,
  pub clock: Sysvar<'info, Clock>
}

// Create a custom struct for us to work with.
#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct DonorStruct {
    pub twitter_handle: String,
    pub donor_name: String,
    pub donated_sol: u32,
    pub user_address: Pubkey,
    pub donated_tokens: Vec<DonatedTokens>
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct DonatedTokens {
    pub donated_token: Pubkey,
    pub donated_amount: Vec<DonatedAmount>,
    pub is_nft: bool,
    pub arweave_link: String,
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct DonatedAmount {
    pub timestamp: i64,
    pub donated_amount: u32,
}

// Tell Solana what we want to store on this account.
#[account]
pub struct BaseAccount {
    pub total_donors: u64,
    pub donor_list: Vec<DonorStruct>
}