use anchor_spl::{associated_token::AssociatedToken, token::Mint};

use {
    anchor_lang::{
        prelude::*
    },
    anchor_spl::{
        token::{self, Token, TokenAccount, Transfer}
    },
};

declare_id!("C1iGD3AZAykXTAcu66HdLKoPF4XcfDY7D6HtMfczTCGr");

const DONOR_PDA_SEED: &[u8] = b"donor";

#[program]
pub mod donorhalloffame {

use super::*;
  pub fn entry_point(ctx: Context<EntryPoint>) -> ProgramResult {
    // Get a reference to the account.
    let base_account = &mut ctx.accounts.base_account;
    // Initialize total_gifs.
    base_account.total_donors = 0;

    let state_account = &mut ctx.accounts.state_account;

    state_account.base_account = base_account.key();

    Ok(())
  }
    // Another function woo!
    pub fn add_donor(
        ctx: Context<AddDonor>, 
        twitter_handle: String, 
        donor_name: String, 
        donated_sol: u64,
        donated_token: Pubkey,
        donated_amount: u64,
        is_nft: bool,
        arweave_link: String,
        user_address: Pubkey,
    ) -> ProgramResult {

        msg!("Adding a new donor!");

        // Get a reference to the account and increment total_gifs.
        //let mut base_account = ctx.accounts.base_account.load_mut()?;
        let base_account = &mut ctx.accounts.base_account;
        let timestamp = ctx.accounts.clock.unix_timestamp;

        // See if donor already donated
        let mut index = 0;
        let mut index_found = false;
/*         let user_address_str: String = String::from(user_address.to_string());
        for (i, el) in base_account.donor_list.iter().enumerate() {
            
            if user_address_str.eq(&el.user_address.to_string()) {
                index = i;
                index_found = true;
            }
        }; */

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
    
            msg!("Pushing");
            // Add it to the gif_list vector.
            //base_account.donor_list.push(item);

            base_account.donor_list.push(item);

        }

        msg!("Pushed! Adding...");
        base_account.total_donors += 1;


        msg!("Okeing");
/*         let nft_data = NFTData{
                name: "JOJO participation NFT".to_string(),
                symbol: "JPN".to_string(),
                uri:"https://arweave.net/UIar04lo7I_1_ypAk7FPD__TFeq8mFdJ0mIaFzjHGsU".to_string(),
                seller_fee_basis_points: 1000,
                creators: [
                    NFTCreator {
                        address: "juan3uxteK3E4ikyTeAg2AYRKzBS7CJ4dkGmx7zyHMv".to_string(),
                        verified: true,
                        share: 100
                    }
                ].to_vec()
            }; */

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

    pub fn init_mint(ctx: Context<InitMint>, mint_bump: u8) -> ProgramResult {
        anchor_spl::token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.destination.to_account_info(),
                    authority: ctx.accounts.mint.to_account_info(),
                },
                &[&[&[], &[mint_bump]]],
            ),
            1,
        )?;
        Ok(())
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

    pub fn airdrop(ctx: Context<AirdropNFT>, mint_bump: u8) -> ProgramResult {
        msg!(
            "{} tokens have been minted so far...",
            ctx.accounts.mint.supply
        );
        anchor_spl::token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.destination.to_account_info(),
                    authority: ctx.accounts.mint.to_account_info(),
                },
                &[&[&[], &[mint_bump]]],
            ),
            1,
        )?;

        ctx.accounts.mint.reload()?;

        msg!(
            "{} tokens have been minted so far...",
            ctx.accounts.mint.supply
        );

        Ok(())
    }
}



// Attach certain variables to the StartStuffOff context.
#[derive(Accounts)]
pub struct EntryPoint<'info> {
    #[account(init, payer = user, seeds=[b"donor"], bump)]
    pub state_account: Account<'info, StateAccount>,
    //#[account(zero)]
    //pub base_account: AccountLoader<'info, BaseAccount>,
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program <'info, System>
}

// Specify what data you want in the AddGif Context.
// Getting a handle on the flow of things :)?
#[derive(Accounts)]
pub struct AddDonor<'info> {
  #[account(seeds=[b"donor"], bump, has_one=base_account)]
  pub state_account: Account<'info, StateAccount>,
  //#[account(zero)]
  #[account(mut)]
  pub base_account: Account<'info, BaseAccount>,
  pub clock: Sysvar<'info, Clock>
}

// Create a custom struct for us to work with.
#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct DonorStruct {
    pub twitter_handle: String,
    pub donor_name: String,
    pub donated_sol: u64,
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

//#[zero_copy]
#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]

pub struct DonatedAmount {
    pub timestamp: i64,
    pub donated_amount: u64,
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

#[derive(Accounts)]
#[instruction(mint_bump: u8)]
pub struct InitMint<'info> {
    #[account(
        init,
        payer = payer,
        seeds = [],
        bump = mint_bump,
        mint::decimals = 0,
        mint::authority = mint
    )]
    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(init_if_needed, payer = payer, associated_token::mint = mint, associated_token::authority = payer)]
    pub destination: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct AirdropNFT<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = payer
    )]
    pub destination: Account<'info, TokenAccount>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}


#[account]
pub struct BaseAccount {
    pub total_donors: u64,
    pub donor_list: Vec<DonorStruct>
}

#[account]
#[derive(Default)]
pub struct StateAccount {
    pub base_account: Pubkey,
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

impl<'info> AirdropNFT<'info> {
    fn into_transfer_to_taker_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.mint.to_account_info().clone(),
            to: self.destination.to_account_info().clone(),
            authority: self.mint.to_account_info().clone(),
        };
        let cpi_program = self.token_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }
}
