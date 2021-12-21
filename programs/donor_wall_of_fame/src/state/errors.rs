
use anchor_lang::prelude::*;

#[error]
pub enum ErrorCode {
    #[msg("You're not autorized to add new donation lists to this account.")]
    AuthDonationListErr,
    #[msg("The donated amount must be bigger than 0!")]
    ZeroDonationErr
}