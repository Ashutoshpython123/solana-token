use anchor_lang::prelude::*;
use anchor_spl::token;
use anchor_spl::token::{MintTo, Mint, Token, Transfer, Burn, FreezeAccount, ThawAccount};

declare_id!("EGLQX6HoYfPxnNd8LSQh4taqPFLXhAjeUxtrU65Zn8TU");

#[program]
pub mod token_contract {
    use super::*;

    pub fn mint_token(ctx: Context<MintToken>, _amount: u64) -> Result<()> {
        // Create the MintTo struct for our context
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();
        // Create the CpiContext we need for the request
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        // Execute anchor's helper function to mint tokens
        token::mint_to(cpi_ctx, _amount)?;
        Ok(())
    }

    pub fn transfer_token(ctx: Context<TransferToken>) -> Result<()> {
        // Create the Transfer struct for our context
        let transfer_instruction = Transfer {
            from: ctx.accounts.from.to_account_info(),
            to: ctx.accounts.to.to_account_info(),
            authority: ctx.accounts.from_authority.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();
        // Create the Context for our Transfer request
        let cpi_ctx = CpiContext::new(cpi_program, transfer_instruction);

        // Execute anchor's helper function to transfer tokens
        anchor_spl::token::transfer(cpi_ctx, 5)?;

        Ok(())
    }

    pub fn burn_token(ctx: Context<BurnToken>, amount: u64) -> Result<()> {        
        let cpi_accounts = Burn {
            mint: ctx.accounts.mint.to_account_info(),
            from: ctx.accounts.from.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        // Create the CpiContext we need for the request
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        // Execute anchor's helper function to burn tokens
        token::burn(cpi_ctx, amount)?;
        Ok(())
    }

    pub fn freeze_account(ctx: Context<Freeze>) -> Result<()> {
        let cpi_accounts = FreezeAccount {
            account: ctx.accounts.account.clone(),
            mint: ctx.accounts.mint.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program,cpi_accounts);

        // Execute anchor's helper function to freeze an account or mint
        token::freeze_account(cpi_ctx)?;

        Ok(())
    }

    pub fn unfreeze_account(ctx: Context<UnFreeze>) -> Result<()> {
        let cpi_accounts = ThawAccount {
            account: ctx.accounts.account.clone(),
            mint: ctx.accounts.mint.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program,cpi_accounts);

        // Execute anchor's helper function to freeze an account or mint
        token::thaw_account(cpi_ctx)?;

        Ok(())
    }

}

#[derive(Accounts)]0..
pub struct MintToken<'info> {
    /// CHECK: This is the token that we want to mint
    #[account(mut)]
    pub mint: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
    /// CHECK: This is the token account that we want to mint tokens to
    #[account(mut)]
    pub token_account: UncheckedAccount<'info>,
    /// CHECK: the authority of the mint account
    #[account(mut)]
    pub authority: AccountInfo<'info>
}

#[derive(Accounts)]
pub struct TransferToken<'info> {
    pub token_program: Program<'info, Token>,
    /// CHECK: The associated token account that we are transferring the token from
    #[account(mut)]
    pub from: UncheckedAccount<'info>,
    /// CHECK: The associated token account that we are transferring the token to
    #[account(mut)]
    pub to: AccountInfo<'info>,
    // the authority of the from account
    pub from_authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct BurnToken<'info> {
    /// CHECK: This is the token that we want to mint
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    /// CHECK: This is the token account that we want to mint tokens to
    #[account(mut)]
    pub from: AccountInfo<'info>,
    /// CHECK: the authority of the mint account
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct Freeze<'info> {
    pub token_program: Program<'info, Token>,
    /// CHECK: This is
    pub account: AccountInfo<'info>,
    /// CHECK: This is the token that we want to mint
    pub mint: AccountInfo<'info>,
    /// CHECK: the authority of the mint account
    pub authority: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct UnFreeze<'info> {
    pub token_program: Program<'info, Token>,
    /// CHECK: This is
    pub account: AccountInfo<'info>,
    /// CHECK: This is the token that we want to mint
    pub mint: AccountInfo<'info>,
    /// CHECK: the authority of the mint account
    pub authority: AccountInfo<'info>,
}
