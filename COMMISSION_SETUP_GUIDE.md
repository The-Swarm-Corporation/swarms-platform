# 🚨 CRITICAL: Commission System Setup Guide

## ⚠️ IMMEDIATE ACTION REQUIRED

This guide ensures that **ALL 10% commission payments go to the correct wallet address** and that proper notifications are sent.

## 🔧 Required Environment Variables

Add these to your `.env` file:

```bash
# CRITICAL: Platform wallet address that receives 10% commission
NEXT_PUBLIC_DAO_TREASURY_ADDRESS="YOUR_PLATFORM_WALLET_ADDRESS_HERE"

# Solana Configuration
RPC_URL="YOUR_SOLANA_RPC_URL_HERE"
NEXT_PUBLIC_SOLANA_NETWORK="mainnet-beta"
NEXT_PUBLIC_MARKETPLACE_ENABLED="true"

# Email Configuration for Commission Notifications
SMTP_HOST="your-smtp-host.com"
SMTP_PORT=465
SMTP_USER="your-smtp-username"
SMTP_PASS="your-smtp-password"

# Commission notification recipient
COMMISSION_NOTIFICATION_EMAIL="gilbertoaceville@gmail.com"

# Optional: SWARMS token address
NEXT_PUBLIC_SWARMS_TOKEN_ADDRESS="YOUR_SWARMS_TOKEN_ADDRESS_HERE"
```

## 🎯 Commission Flow Verification

### 1. Commission Rate
- **Rate**: 10% (0.1) - defined in `shared/utils/marketplace/commission.ts`
- **Calculation**: Automatically calculated with 6 decimal precision
- **Validation**: Built-in validation ensures accuracy

### 2. Payment Distribution
For every marketplace transaction:
- **Buyer pays**: Full amount (e.g., 1 SOL)
- **Seller receives**: 90% (e.g., 0.9 SOL)
- **Platform receives**: 10% (e.g., 0.1 SOL)

### 3. Transaction Flow
1. Buyer initiates purchase
2. Two Solana transfers are created:
   - Transfer 1: 90% to seller wallet
   - Transfer 2: 10% to platform wallet (`NEXT_PUBLIC_DAO_TREASURY_ADDRESS`)
3. Transaction is recorded in database
4. Email notifications are sent to all parties

## 📧 Notification System

### Automatic Emails Sent:
1. **Buyer**: Purchase confirmation
2. **Seller**: Sale notification with earnings breakdown
3. **Platform** (`gilbertoaceville@gmail.com`): Commission notification

### Email Content Includes:
- Transaction details
- Commission breakdown
- Wallet addresses
- Solana blockchain verification link

## 🔍 Verification Steps

### 1. Run Verification Script
```bash
npx tsx scripts/verify-commission-setup.ts
```

### 2. Check Commission Report
Visit: `https://your-domain.com/api/admin/commission-report?format=html`

### 3. Test Transaction Flow
1. Create a test prompt/agent with small price (e.g., 0.001 SOL)
2. Purchase it with a test wallet
3. Verify:
   - Seller receives 90%
   - Platform wallet receives 10%
   - All parties receive email notifications

## 🚨 Critical Wallet Address

**ENSURE THIS IS SET CORRECTLY:**
```bash
NEXT_PUBLIC_DAO_TREASURY_ADDRESS="YOUR_ACTUAL_PLATFORM_WALLET_ADDRESS"
```

This address receives ALL 10% commission payments. Double-check:
- ✅ Address is valid Solana public key
- ✅ You control the private key
- ✅ Address is on the correct network (mainnet/devnet)

## 📊 Monitoring & Reports

### Real-time Monitoring
- Commission report: `/api/admin/commission-report`
- Transaction history: Available in user accounts
- Database: `marketplace_transactions` table

### Key Metrics Tracked:
- Total commissions received
- Transaction volume
- Commission rate verification
- Failed transactions

## 🔒 Security Considerations

1. **Private Keys**: Never expose private keys in environment variables
2. **RPC URLs**: Keep RPC URLs private (not NEXT_PUBLIC_)
3. **Email Security**: Use secure SMTP credentials
4. **Wallet Verification**: Always verify wallet addresses before deployment

## 🚀 Deployment Checklist

Before going live:

- [ ] All environment variables are set
- [ ] Platform wallet address is verified
- [ ] SMTP configuration is working
- [ ] Verification script passes all checks
- [ ] Test transaction completed successfully
- [ ] Commission notifications received
- [ ] Database tables are properly configured

## 🆘 Troubleshooting

### Commission Not Received
1. Check `NEXT_PUBLIC_DAO_TREASURY_ADDRESS` is correct
2. Verify transaction on Solscan
3. Check database `marketplace_transactions` table
4. Review server logs for errors

### Email Notifications Not Sent
1. Verify SMTP configuration
2. Check email addresses in database
3. Review server logs for email errors
4. Test SMTP connection manually

### Transaction Failures
1. Check RPC URL connectivity
2. Verify wallet has sufficient SOL for fees
3. Check Solana network status
4. Review transaction retry logic

## 📞 Support

For commission system issues:
- Check server logs first
- Run verification script
- Review transaction on blockchain
- Contact development team with specific error details

---

**⚠️ CRITICAL REMINDER**: The platform wallet address (`NEXT_PUBLIC_DAO_TREASURY_ADDRESS`) receives ALL commission payments. Ensure this is set correctly before any production transactions!
