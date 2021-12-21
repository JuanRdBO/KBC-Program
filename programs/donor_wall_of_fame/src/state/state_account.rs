use anchor_lang::prelude::*;

#[account]
pub struct StateAccount {
    pub name: String,
    pub authority: Pubkey,
    pub donation_treasury: Pubkey,
    pub bump: u8,
    pub total_donor_lists: u8,
    pub donor_lists: Vec<Pubkey> // Each State Account can hold ~100 list references
}
