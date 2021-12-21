
use anchor_lang::prelude::*;

#[error]
pub enum ErrorCode {
    #[msg("You're not autorized to add new donation lists to this account.")]
    AuthDonationListErr
}