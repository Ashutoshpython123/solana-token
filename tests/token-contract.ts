import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { TokenContract } from "../target/types/token_contract";
import {
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createInitializeMintInstruction,
} from "@solana/spl-token";
import { assert } from "chai";

describe("token-contract", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  // Retrieve the TokenContract struct from our smart contract
  const program = anchor.workspace.TokenContract as Program<TokenContract>;
  // Generate a random keypair that will represent our token
  const mintKey: anchor.web3.Keypair = anchor.web3.Keypair.generate();
  // AssociatedTokenAccount for anchor's workspace wallet
  let associatedTokenAccount = undefined;
  const fetchBalance = async (account: any) => {
    return (await program.provider.connection.getParsedAccountInfo(account)).value.data.parsed.info.tokenAmount.amount;
  }


  const key = anchor.AnchorProvider.env().wallet.publicKey;
  it("Mint a token", async () => {
    // Get anchor's wallet's public key
    // Get the amount of SOL needed to pay rent for our Token Mint
    const lamports: number = await program.provider.connection.getMinimumBalanceForRentExemption(
      MINT_SIZE
    );

    // Get the ATA for a token and the account that we want to own the ATA (but it might not existing on the SOL network yet)
    associatedTokenAccount = await getAssociatedTokenAddress(
      mintKey.publicKey,
      key
    );

    // Fires a list of instructions
    const mint_tx = new anchor.web3.Transaction().add(
      // Use anchor to create an account from the mint key that we created
      anchor.web3.SystemProgram.createAccount({
        fromPubkey: key,
        newAccountPubkey: mintKey.publicKey,
        space: MINT_SIZE,
        programId: TOKEN_PROGRAM_ID,
        lamports,
      }),
      // Fire a transaction to create our mint account that is controlled by our anchor wallet
      createInitializeMintInstruction(
        mintKey.publicKey, 0, key, key
      ),
      // Create the ATA account that is associated with our mint on our anchor wallet
      createAssociatedTokenAccountInstruction(
        key, associatedTokenAccount, key, mintKey.publicKey
      )
    );

    // sends and create the transaction
    const res = await anchor.AnchorProvider.env().sendAndConfirm(mint_tx, [mintKey]);

    console.log(
      await program.provider.connection.getParsedAccountInfo(mintKey.publicKey)
    );

    console.log("Account: ", res);
    console.log("Mint key: ", mintKey.publicKey.toString());
    console.log("User: ", key.toString());

    await program.methods.mintToken(new anchor.BN(10)).accounts({
        mint: mintKey.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        tokenAccount: associatedTokenAccount,
        authority: key,
      }).rpc();

    // Get minted token amount on the ATA for our anchor wallet
    const minted = await fetchBalance(associatedTokenAccount)
    console.log(minted, "minted+++")
    assert.equal(minted, 10);
  });

  it("Transfer token", async () => {
    // Get anchor's wallet's public key
    const myWallet = anchor.AnchorProvider.env().wallet.publicKey;
    // Wallet that will receive the token 
    const toWallet: anchor.web3.Keypair = anchor.web3.Keypair.generate();
    // The ATA for a token on the to wallet (but might not exist yet)
    const toATA = await getAssociatedTokenAddress(
      mintKey.publicKey,
      toWallet.publicKey
    );

    // Fires a list of instructions
    const mint_tx = new anchor.web3.Transaction().add(
      // Create the ATA account that is associated with our To wallet
      createAssociatedTokenAccountInstruction(
        myWallet, toATA, toWallet.publicKey, mintKey.publicKey
      )
    );

    // Sends and create the transaction
    await anchor.AnchorProvider.env().sendAndConfirm(mint_tx, []);

    // Executes our transfer smart contract 
    await program.methods.transferToken().accounts({
      tokenProgram: TOKEN_PROGRAM_ID,
      from: associatedTokenAccount,
      fromAuthority: myWallet,
      to: toATA,
    }).rpc();

    // Get minted token amount on the ATA for our anchor wallet
    const minted = await fetchBalance(associatedTokenAccount)
    console.log(minted, "minted---------__")
    assert.equal(minted, 5);
  });


  it("Burn token", async () => {
    // Get anchor's wallet's public key
    const balance = await fetchBalance(associatedTokenAccount)
    console.log("balance-", balance)

    await program.methods.burnToken(new anchor.BN(5)).accounts({
      mint: mintKey.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      from: associatedTokenAccount,
      authority: key,
    }).rpc();

    // Get minted token amount on the ATA for our anchor wallet
    const burnt = await fetchBalance(associatedTokenAccount)
    console.log("after burn balance --", burnt)
  });


  // it("Freeze token", async () => {
  //   // Get anchor's wallet's public key
  //   const balance = await fetchBalance(associatedTokenAccount)
  //   console.log("Mint Key:", mintKey.publicKey.toString());
  //   console.log("Associated Token Account:", associatedTokenAccount.toString());
  //   console.log("Authority Key:", key.toString());
  //   console.log("Token Program ID:", TOKEN_PROGRAM_ID.toString());
  //   console.log("balance freeze +3333333333---------__", balance)

  //   const onr = (await program.provider.connection.getParsedAccountInfo(associatedTokenAccount))
  //   console.log(onr.value.owner, "onronronr", mintKey)
  //   await program.methods.freezeAccount().accounts({
  //     mint: mintKey.publicKey,
  //     tokenProgram: TOKEN_PROGRAM_ID,
  //     account: associatedTokenAccount,
  //     authority: key,
  //   })
  //   .signers([associatedTokenAccount])
  //   .rpc();

  //   // Get minted token amount on the ATA for our anchor wallet
  //   const burnt = await fetchBalance(associatedTokenAccount)
  //   console.log("after freeze balance +33333333---------__", burnt)
  // });
});


