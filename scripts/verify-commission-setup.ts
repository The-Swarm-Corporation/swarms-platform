#!/usr/bin/env tsx

/**
 * Commission Setup Verification Script
 * 
 * This script verifies that the marketplace commission system is properly configured:
 * 1. Environment variables are set
 * 2. Wallet addresses are valid
 * 3. Commission calculations are correct
 * 4. Notification system is working
 */

import { PublicKey } from '@solana/web3.js';
import { calculateCommission, validateCommissionCalculation } from '../shared/utils/marketplace/commission';

interface VerificationResult {
  category: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  details?: string;
}

const results: VerificationResult[] = [];

function addResult(category: string, status: 'PASS' | 'FAIL' | 'WARNING', message: string, details?: string) {
  results.push({ category, status, message, details });
}

function verifyEnvironmentVariables() {
  console.log('🔍 Verifying Environment Variables...\n');

  // Check critical environment variables
  const requiredVars = [
    'NEXT_PUBLIC_DAO_TREASURY_ADDRESS',
    'RPC_URL',
    'NEXT_PUBLIC_MARKETPLACE_ENABLED',
    'SMTP_HOST',
    'SMTP_USER',
    'SMTP_PASS'
  ];

  const optionalVars = [
    'COMMISSION_NOTIFICATION_EMAIL',
    'NEXT_PUBLIC_SWARMS_TOKEN_ADDRESS',
    'NEXT_PUBLIC_SOLANA_NETWORK'
  ];

  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value) {
      addResult('Environment', 'FAIL', `Missing required variable: ${varName}`);
    } else {
      addResult('Environment', 'PASS', `${varName} is set`);
    }
  }

  for (const varName of optionalVars) {
    const value = process.env[varName];
    if (!value) {
      addResult('Environment', 'WARNING', `Optional variable not set: ${varName}`);
    } else {
      addResult('Environment', 'PASS', `${varName} is set`);
    }
  }
}

function verifyWalletAddresses() {
  console.log('🔍 Verifying Wallet Addresses...\n');

  const treasuryAddress = process.env.NEXT_PUBLIC_DAO_TREASURY_ADDRESS;
  const swarmsTokenAddress = process.env.NEXT_PUBLIC_SWARMS_TOKEN_ADDRESS;

  // Verify treasury address
  if (treasuryAddress) {
    try {
      new PublicKey(treasuryAddress);
      addResult('Wallet', 'PASS', 'Treasury wallet address is valid', treasuryAddress);
    } catch (error) {
      addResult('Wallet', 'FAIL', 'Treasury wallet address is invalid', treasuryAddress);
    }
  }

  // Verify SWARMS token address
  if (swarmsTokenAddress) {
    try {
      new PublicKey(swarmsTokenAddress);
      addResult('Wallet', 'PASS', 'SWARMS token address is valid', swarmsTokenAddress);
    } catch (error) {
      addResult('Wallet', 'FAIL', 'SWARMS token address is invalid', swarmsTokenAddress);
    }
  }
}

function verifyCommissionCalculations() {
  console.log('🔍 Verifying Commission Calculations...\n');

  const testAmounts = [0.001, 0.1, 1, 10, 100, 999];

  for (const amount of testAmounts) {
    const commission = calculateCommission(amount);
    const isValid = validateCommissionCalculation(amount, commission.platformFee, commission.sellerAmount);

    if (isValid) {
      addResult('Commission', 'PASS', `Calculation correct for ${amount} SOL`, 
        `Platform: ${commission.platformFee}, Seller: ${commission.sellerAmount}`);
    } else {
      addResult('Commission', 'FAIL', `Calculation incorrect for ${amount} SOL`,
        `Platform: ${commission.platformFee}, Seller: ${commission.sellerAmount}`);
    }

    // Verify 10% commission rate
    const expectedFee = amount * 0.1;
    const actualFee = commission.platformFee;
    const difference = Math.abs(expectedFee - actualFee);

    if (difference < 0.000001) {
      addResult('Commission', 'PASS', `10% rate verified for ${amount} SOL`);
    } else {
      addResult('Commission', 'FAIL', `10% rate incorrect for ${amount} SOL`,
        `Expected: ${expectedFee}, Actual: ${actualFee}`);
    }
  }
}

function verifyNotificationConfig() {
  console.log('🔍 Verifying Notification Configuration...\n');

  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const commissionEmail = process.env.COMMISSION_NOTIFICATION_EMAIL || 'gilbertoaceville@gmail.com';

  if (smtpHost && smtpUser && smtpPass) {
    addResult('Notifications', 'PASS', 'SMTP configuration is complete');
  } else {
    addResult('Notifications', 'FAIL', 'SMTP configuration is incomplete',
      `Missing: ${!smtpHost ? 'SMTP_HOST ' : ''}${!smtpUser ? 'SMTP_USER ' : ''}${!smtpPass ? 'SMTP_PASS' : ''}`);
  }

  // Verify commission email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(commissionEmail)) {
    addResult('Notifications', 'PASS', `Commission email is valid: ${commissionEmail}`);
  } else {
    addResult('Notifications', 'FAIL', `Commission email is invalid: ${commissionEmail}`);
  }
}

function printResults() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMMISSION SYSTEM VERIFICATION RESULTS');
  console.log('='.repeat(80));

  const categories = [...new Set(results.map(r => r.category))];
  
  for (const category of categories) {
    console.log(`\n📁 ${category.toUpperCase()}`);
    console.log('-'.repeat(40));

    const categoryResults = results.filter(r => r.category === category);
    
    for (const result of categoryResults) {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`${icon} ${result.message}`);
      if (result.details) {
        console.log(`   Details: ${result.details}`);
      }
    }
  }

  // Summary
  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  const warningCount = results.filter(r => r.status === 'WARNING').length;

  console.log('\n' + '='.repeat(80));
  console.log('📈 SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Passed: ${passCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`⚠️  Warnings: ${warningCount}`);

  if (failCount > 0) {
    console.log('\n🚨 CRITICAL ISSUES FOUND! Please fix the failed items before deploying to production.');
    process.exit(1);
  } else if (warningCount > 0) {
    console.log('\n⚠️  Some warnings found. Review optional configurations.');
  } else {
    console.log('\n🎉 All checks passed! Commission system is properly configured.');
  }
}

function main() {
  console.log('🚀 Starting Commission System Verification...\n');

  verifyEnvironmentVariables();
  verifyWalletAddresses();
  verifyCommissionCalculations();
  verifyNotificationConfig();

  printResults();
}

// Run verification if this script is executed directly
if (require.main === module) {
  main();
}

export { main as verifyCommissionSetup };
