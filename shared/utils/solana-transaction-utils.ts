import {
  Connection,
  Transaction,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';

interface TransactionParams {
  connection: Connection;
  fromPubkey: PublicKey;
  toPubkey: PublicKey;
  platformPubkey: PublicKey;
  sellerAmount: number;
  platformFee: number;
  solana: any;
}

interface RetryableTransactionResult {
  signature: string;
  success: boolean;
  error?: string;
}

export async function executeTransactionWithRetry(
  params: TransactionParams,
  maxRetries: number = 3,
): Promise<RetryableTransactionResult> {
  const {
    connection,
    fromPubkey,
    toPubkey,
    platformPubkey,
    sellerAmount,
    platformFee,
    solana,
  } = params;

  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash('confirmed');

      const transaction = new Transaction();

      transaction.add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports: Math.floor(sellerAmount),
        }),
      );

      if (platformFee > 0) {
        transaction.add(
          SystemProgram.transfer({
            fromPubkey,
            toPubkey: platformPubkey,
            lamports: Math.floor(platformFee),
          }),
        );
      }

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;

      const signedTransaction = await solana.signTransaction(transaction);

      let signature: string;
      try {
        signature = await connection.sendRawTransaction(
          signedTransaction.serialize(),
          {
            skipPreflight: false,
            preflightCommitment: 'confirmed',
            maxRetries: 3,
          },
        );
      } catch (sendError: any) {
        if (isBlockhashError(sendError)) {
          retryCount++;
          if (retryCount < maxRetries) {
            console.log(
              `Blockhash expired, retrying... (${retryCount}/${maxRetries})`,
            );
            await sleep(1000);
            continue;
          }
        }
        throw sendError;
      }

      const confirmation = await connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        'confirmed',
      );

      if (confirmation.value.err) {
        throw new Error(
          `Transaction failed: ${JSON.stringify(confirmation.value.err)}`,
        );
      }

      const transactionDetails = await connection.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      });

      if (!transactionDetails || transactionDetails.meta?.err) {
        throw new Error('Transaction verification failed');
      }

      return {
        signature,
        success: true,
      };
    } catch (error: any) {
      console.error(`Transaction error (attempt ${retryCount + 1}):`, error);

      const isRetryable = isRetryableError(error);
      retryCount++;

      if (isRetryable && retryCount < maxRetries) {
        console.log(
          `Retryable error, attempting retry ${retryCount}/${maxRetries}`,
        );
        await sleep(2000);
        continue;
      }

      return {
        signature: '',
        success: false,
        error: getErrorMessage(error),
      };
    }
  }

  return {
    signature: '',
    success: false,
    error: 'Max retries reached',
  };
}

function isBlockhashError(error: any): boolean {
  const message = error.message?.toLowerCase() || '';
  return (
    message.includes('blockhash not found') ||
    message.includes('transaction simulation failed') ||
    message.includes('blockhash')
  );
}

function isRetryableError(error: any): boolean {
  const message = error.message?.toLowerCase() || '';
  return (
    message.includes('blockhash not found') ||
    message.includes('transaction simulation failed') ||
    message.includes('429') || // Rate limit
    message.includes('timeout') ||
    message.includes('network') ||
    message.includes('connection') ||
    message.includes('rpc')
  );
}

function getErrorMessage(error: any): string {
  const message = error.message || '';

  if (message.includes('Blockhash not found')) {
    return 'Transaction expired. Please try again.';
  } else if (message.includes('insufficient funds')) {
    return 'Insufficient SOL balance for this transaction.';
  } else if (message.includes('User rejected')) {
    return 'Transaction cancelled by user.';
  } else if (message.includes('Transaction simulation failed')) {
    return 'Transaction failed. Please check your balance and try again.';
  } else if (message.includes('timeout')) {
    return 'Transaction timed out. Please try again.';
  } else if (message.includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }

  return message || 'Transaction failed';
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createEnhancedConnection(rpcUrl: string): Connection {
  return new Connection(rpcUrl, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000, // 60 seconds
    wsEndpoint: undefined, // Disable websocket for stability
  });
}
