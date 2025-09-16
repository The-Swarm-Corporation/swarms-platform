/**
 * Jupiter Studio Token Launch Utility
 * 
 * This module provides a comprehensive function to launch tokens on Jupiter Studio
 * with custom market cap parameters (6k SOL start, 80k SOL graduation).
 * 
 * Key Features:
 * - Creates tokens with custom bonding curve parameters
 * - Handles image and metadata uploads automatically
 * - Supports both JSON array and base64 private key formats
 * - Includes comprehensive error handling and validation
 * - Anti-sniping protection enabled by default
 * - LP token locking for security
 * 
 * Usage Example:
 * ```typescript
 * import { launchCoin } from './launch_coin';
 * 
 * const result = await launchCoin({
 *   userPublicAddress: 'YourSolanaPublicKeyHere',
 *   tokenName: 'My Token',
 *   tokenSymbol: 'MTK',
 *   imageUrl: 'https://example.com/token-image.jpg',
 *   privateKey: '[1,2,3,...]', // JSON array from Solana CLI
 * });
 * ```
 */

import { Keypair, PublicKey, VersionedTransaction } from '@solana/web3.js';
import fs from 'fs';

/**
 * Interface for token launch parameters
 */
interface LaunchTokenParams {
  userPublicAddress: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDescription?: string;
  imageUrl: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  headerImagePath?: string;
  contentDescription?: string;
  privateKey?: string; // Optional - for wallet signing
}

/**
 * Interface for the create transaction response
 */
interface CreateTransactionResponse {
  transaction: string;
  mint: string;
  imagePresignedUrl: string;
  metadataPresignedUrl: string;
  imageUrl: string;
}

/**
 * Interface for the submit response
 */
interface SubmitResponse {
  success: boolean;
  mint?: string;
  poolId?: string;
  error?: string;
}

/**
 * Launch a token on Jupiter Studio with custom market cap parameters
 * Market cap starts at 6k SOL and graduates at 80k SOL
 * 
 * @param params - Token launch parameters
 * @returns Promise with the launch result
 */
export async function launchCoin(params: LaunchTokenParams): Promise<SubmitResponse> {
  try {
    // Validate required parameters
    if (!params.userPublicAddress || !params.tokenName || !params.tokenSymbol || !params.imageUrl) {
      throw new Error('Missing required parameters: userPublicAddress, tokenName, tokenSymbol, and imageUrl are required');
    }

    // Validate public key format
    try {
      new PublicKey(params.userPublicAddress);
    } catch (error) {
      throw new Error('Invalid public key format for userPublicAddress');
    }

    console.log(`🚀 Starting token launch for ${params.tokenName} (${params.tokenSymbol})`);

    // Step 1: Create the transaction
    console.log('📋 Creating transaction...');
    const createTransaction = await createTokenTransaction(params);
    
    if (!createTransaction.transaction) {
      throw new Error('Failed to create transaction');
    }

    console.log(`✅ Transaction created. Mint: ${createTransaction.mint}`);

    // Step 2: Upload token image
    console.log('🖼️ Uploading token image...');
    await uploadTokenImage(createTransaction.imagePresignedUrl, params.imageUrl);
    console.log('✅ Token image uploaded successfully');

    // Step 3: Upload token metadata
    console.log('📄 Uploading token metadata...');
    await uploadTokenMetadata(createTransaction, params);
    console.log('✅ Token metadata uploaded successfully');

    // Step 4: Sign and submit transaction
    console.log('✍️ Signing and submitting transaction...');
    const result = await signAndSubmitTransaction(createTransaction, params);
    
    if (result.success) {
      console.log(`🎉 Token launched successfully! Mint: ${result.mint}`);
      return result;
    } else {
      throw new Error(result.error || 'Failed to submit transaction');
    }

  } catch (error) {
    console.error('❌ Token launch failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Create the token transaction using Jupiter Studio API
 */
async function createTokenTransaction(params: LaunchTokenParams): Promise<CreateTransactionResponse> {
  const response = await fetch('https://lite-api.jup.ag/studio/v1/dbc-pool/create-tx', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      buildCurveByMarketCapParam: {
        quoteMint: 'So11111111111111111111111111111111111111112', // SOL (wrapped SOL)
        initialMarketCap: 6000, // Start at 6k SOL
        migrationMarketCap: 80000, // Graduate at 80k SOL
        tokenQuoteDecimal: 9, // SOL has 9 decimals
        lockedVestingParam: {
          totalLockedVestingAmount: 0,
          cliffUnlockAmount: 0,
          numberOfVestingPeriod: 0,
          totalVestingDuration: 0,
          cliffDurationFromMigrationTime: 0,
        },
      },
      antiSniping: true, // Enable anti-sniping protection
      fee: {
        feeBps: 100, // 1% fee
      },
      isLpLocked: true, // Lock liquidity pool
      tokenName: params.tokenName,
      tokenSymbol: params.tokenSymbol,
      tokenImageContentType: 'image/jpeg',
      creator: params.userPublicAddress,
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create transaction: ${response.status} ${errorText}`);
  }

  return await response.json();
}

/**
 * Upload token image to the presigned URL
 */
async function uploadTokenImage(imagePresignedUrl: string, imageUrl: string): Promise<void> {
  // Fetch the image from the provided URL
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to fetch image from URL: ${imageUrl}`);
  }

  const imageBuffer = await imageResponse.arrayBuffer();
  
  // Upload to presigned URL
  const uploadResponse = await fetch(imagePresignedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'image/jpeg',
    },
    body: imageBuffer,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload image: ${uploadResponse.status}`);
  }
}

/**
 * Upload token metadata to the presigned URL
 */
async function uploadTokenMetadata(
  createTransaction: CreateTransactionResponse, 
  params: LaunchTokenParams
): Promise<void> {
  const metadata = {
    name: params.tokenName,
    symbol: params.tokenSymbol,
    description: params.tokenDescription || `${params.tokenName} token launched on Jupiter Studio`,
    image: createTransaction.imageUrl,
    website: params.website || '',
    twitter: params.twitter || '',
    telegram: params.telegram || '',
  };

  const metadataResponse = await fetch(createTransaction.metadataPresignedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(metadata, null, 2),
  });

  if (!metadataResponse.ok) {
    throw new Error(`Failed to upload metadata: ${metadataResponse.status}`);
  }
}

/**
 * Sign and submit the transaction
 */
async function signAndSubmitTransaction(
  createTransaction: CreateTransactionResponse,
  params: LaunchTokenParams
): Promise<SubmitResponse> {
  // Create wallet from private key or throw error if not provided
  if (!params.privateKey) {
    throw new Error('Private key is required for transaction signing. Please provide privateKey parameter.');
  }

  let wallet: Keypair;
  try {
    // Try parsing as JSON array first (like from Solana CLI - most common format)
    const privateKeyArray = JSON.parse(params.privateKey);
    if (Array.isArray(privateKeyArray) && privateKeyArray.length === 64) {
      wallet = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
    } else {
      throw new Error('Invalid private key array format');
    }
  } catch (error) {
    try {
      // Try parsing as base64 format
      const privateKeyBuffer = Buffer.from(params.privateKey, 'base64');
      if (privateKeyBuffer.length === 64) {
        wallet = Keypair.fromSecretKey(privateKeyBuffer);
      } else {
        throw new Error('Invalid private key buffer length');
      }
    } catch (base64Error) {
      throw new Error('Invalid private key format. Please provide a valid JSON array (from Solana CLI) or base64 format private key.');
    }
  }

  // Verify the wallet matches the provided public address
  if (wallet.publicKey.toBase58() !== params.userPublicAddress) {
    throw new Error('Private key does not match the provided public address');
  }

  // Deserialize and sign the transaction
  const transaction = VersionedTransaction.deserialize(
    Buffer.from(createTransaction.transaction, 'base64')
  );
  transaction.sign([wallet]);
  const signedTransaction = Buffer.from(transaction.serialize()).toString('base64');

  // Prepare form data
  const formData = new FormData();
  formData.append('transaction', signedTransaction);
  formData.append('owner', wallet.publicKey.toBase58());
  formData.append('content', params.contentDescription || '');
  
  // Add header image if provided
  if (params.headerImagePath && fs.existsSync(params.headerImagePath)) {
    const headerImageBuffer = fs.readFileSync(params.headerImagePath);
    const headerImageBlob = new Blob([headerImageBuffer], { type: 'image/jpeg' });
    formData.append('headerImage', headerImageBlob, 'header.jpeg');
  }

  // Submit transaction
  const response = await fetch('https://lite-api.jup.ag/studio/v1/dbc-pool/submit', {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  
  if (!response.ok) {
    return {
      success: false,
      error: `Submission failed: ${result.error || response.statusText}`
    };
  }

  return {
    success: true,
    mint: createTransaction.mint,
    poolId: result.poolId,
  };
}

/**
 * Quick launch function with minimal parameters
 * Useful for simple token launches with just the essentials
 */
export async function quickLaunchCoin(
  userPublicAddress: string,
  tokenName: string,
  tokenSymbol: string,
  imageUrl: string,
  privateKey: string
): Promise<SubmitResponse> {
  return launchCoin({
    userPublicAddress,
    tokenName,
    tokenSymbol,
    imageUrl,
    privateKey,
    tokenDescription: `${tokenName} - A token launched on Jupiter Studio`,
  });
}

/**
//  * Example usage function with comprehensive parameters
//  */
// export async function exampleLaunchCoin() {
//   const result = await launchCoin({
//     userPublicAddress: 'YOUR_PUBLIC_KEY_HERE',
//     tokenName: 'My Awesome Token',
//     tokenSymbol: 'MAT',
//     tokenDescription: 'This is my awesome token created with Jupiter Studio',
//     imageUrl: 'https://example.com/token-image.jpg',
//     website: 'https://mytoken.com',
//     twitter: 'https://twitter.com/mytoken',
//     telegram: 'https://t.me/mytoken',
//     privateKey: 'YOUR_PRIVATE_KEY_HERE', // JSON array or base64 format
//     contentDescription: 'Welcome to My Awesome Token! This token represents...',
//     // headerImagePath: '/path/to/header-image.jpg', // Optional
//   });

//   console.log('Launch result:', result);
//   return result;
// }
