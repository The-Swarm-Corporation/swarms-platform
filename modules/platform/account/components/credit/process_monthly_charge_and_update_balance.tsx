import { fetchTotalChargesLastMonth } from './fetch_api_usage';
import { updateBalance } from './credit_balance';

/**
 * Processes monthly charges and updates user balances.
 *
 * @returns A promise that resolves when all balances are updated successfully.
 * @throws An error if there is an error processing the monthly charges.
 */
// Process monthly charges and update balances
export async function processMonthlyChargesAndUpdateBalances(): Promise<void> {
  try {
    const totalCharges = await fetchTotalChargesLastMonth();

    for (const { user_id, total_charge } of totalCharges) {
      await updateBalance(user_id, total_charge, 'debit');
      console.log(
        `Updated balance for user ${user_id} by deducting ${total_charge}`,
      );
    }

    console.log('All balances updated successfully.');
  } catch (error) {
    console.error(
      'Failed to process monthly charges and update balances:',
      error,
    );
  }
}
