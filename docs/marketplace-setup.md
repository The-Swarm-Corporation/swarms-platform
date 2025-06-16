# Swarms Marketplace Setup Guide

## Overview
The Swarms platform now includes a crypto-based marketplace where users can buy and sell prompts and agents using Solana (SOL). The platform takes a 10% commission on all sales.

## Key Features

### 1. Marketplace Wallet Integration
- **Location**: Account page → Crypto tab → Marketplace sub-tab
- **Functionality**: Connect Phantom wallet for marketplace transactions
- **Sub-tabs**:
  - **Wallet**: Connection, balance display, wallet management
  - **Transactions**: Complete transaction history and statistics

### 2. Pricing for Prompts and Agents
- **Free Content**: Default setting, accessible to all users
- **Paid Content**: Price range 0.01 - 999 SOL
- **Commission**: Platform takes 10%, seller receives 90%
- **Wallet Requirement**: Sellers must provide Solana wallet address

### 3. Access Control
- **Free Items**: Accessible to all users immediately
- **Paid Items**: Require purchase before access
- **Owner Access**: Creators can always access their own content
- **Purchase Verification**: Automatic check on dynamic pages

### 4. Purchase Flow
1. User visits paid prompt/agent page
2. Access restriction screen shows pricing and details
3. User connects wallet (if not already connected)
4. Purchase modal handles Solana transaction
5. Platform splits payment (90% to seller, 10% to platform)
6. Purchase recorded in database
7. User gains immediate access to content

## Database Schema

### New Tables
- `marketplace_transactions`: Records all purchase transactions
- `marketplace_user_purchases`: Tracks user purchases for access control
- `marketplace_user_wallets`: Stores user wallet addresses

### Updated Tables
- `swarms_cloud_prompts`: Added `is_free`, `price`, `seller_wallet_address`
- `swarms_cloud_agents`: Added `is_free`, `price`, `seller_wallet_address`

## Environment Variables Required

```env
# Crypto Marketplace
RPC_URL="https://api.mainnet-beta.solana.com"
NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS=""
NEXT_PUBLIC_MARKETPLACE_ENABLED="true"
```

## Components Structure

### Core Components
- `MarketplaceWallet`: Main marketplace interface with wallet and transaction tabs
- `MarketplaceTransactions`: Transaction history with filtering and statistics
- `AccessRestriction`: Wrapper for dynamic pages to control access
- `PurchaseModal`: Handles Solana payment transactions
- `WalletProvider`: Context provider for wallet state management

### tRPC Endpoints
- `marketplace.saveUserWallet`: Save user wallet address
- `marketplace.getUserWallet`: Get user wallet info
- `marketplace.checkUserPurchase`: Verify if user purchased item
- `marketplace.createTransaction`: Record completed transaction
- `marketplace.getUserTransactions`: Get user transaction history
- `marketplace.getMarketplaceStats`: Platform statistics

## Usage Instructions

### For Sellers (Creating Paid Content)
1. Navigate to Explorer page
2. Click "Add Agent" or "Add Prompt"
3. Fill in content details
4. In Pricing section:
   - Select "PAID" option
   - Enter price (0.01 - 999 SOL)
   - Provide your Solana wallet address
5. Submit for approval

### For Buyers (Purchasing Content)
1. Browse Explorer page for paid content
2. Click on paid prompt/agent
3. Review pricing and details on access restriction page
4. Click "Purchase for X SOL"
5. Connect Phantom wallet if needed
6. Confirm transaction in wallet
7. Access content immediately after purchase

### For Viewing Transaction History
1. Navigate to Account → Crypto → Marketplace → Transactions
2. View comprehensive statistics:
   - Total purchases and sales count
   - Total amount spent and earned
   - Platform-wide transaction volume
3. Filter transactions by type:
   - All Transactions: Complete history
   - Purchases: Items you've bought
   - Sales: Items you've sold
4. Each transaction shows:
   - Transaction type and amount
   - Platform fee breakdown
   - Blockchain verification link
   - Timestamp and status

### For Platform Admins
- Monitor transactions via marketplace stats endpoint
- Platform wallet automatically receives 10% commission
- All transactions recorded with signatures for verification

## Security Features

### Row Level Security (RLS)
- Users can only view their own transactions and purchases
- Wallet addresses are protected per user
- Transaction integrity maintained

### Transaction Verification
- All purchases verified via Solana blockchain
- Transaction signatures stored for audit trail
- Duplicate purchase prevention

### Access Control
- Dynamic page access based on purchase verification
- Owner bypass for content creators
- Real-time purchase status checking

## Testing Checklist

### Wallet Connection
- [ ] Connect Phantom wallet in marketplace tab
- [ ] Display wallet address and SOL balance
- [ ] Disconnect wallet functionality
- [ ] Auto-reconnect on page refresh

### Transaction History
- [ ] View transaction statistics (purchases, sales, spent, earned)
- [ ] Filter transactions by type (all, purchases, sales)
- [ ] Display transaction details with blockchain links
- [ ] Show platform fee breakdowns
- [ ] Real-time transaction status updates

### Content Creation
- [ ] Create free prompt/agent (default behavior)
- [ ] Create paid prompt/agent with pricing
- [ ] Validate price limits (0.01 - 999 SOL)
- [ ] Require wallet address for paid content

### Purchase Flow
- [ ] Access restriction shows for paid content
- [ ] Purchase modal displays correct pricing
- [ ] Solana transaction completes successfully
- [ ] Platform commission calculated correctly (10%)
- [ ] Purchase recorded in database
- [ ] Immediate access granted after purchase

### Access Control
- [ ] Free content accessible without purchase
- [ ] Paid content blocked until purchase
- [ ] Owner can access their own paid content
- [ ] Purchase verification works across sessions

## Troubleshooting

### Common Issues
1. **Phantom Wallet Not Detected**
   - Ensure Phantom extension is installed
   - Refresh page and try again

2. **Transaction Fails**
   - Check SOL balance is sufficient
   - Verify network connection
   - Ensure platform wallet address is configured

3. **Access Still Restricted After Purchase**
   - Check transaction was confirmed on blockchain
   - Verify purchase was recorded in database
   - Try refreshing the page

### Environment Setup
1. **Missing RPC URL**
   - Configure `RPC_URL` (private, server-side only)
   - Use Solana public RPC or Helius endpoint

2. **Platform Wallet Not Set**
   - Configure `NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS`
   - Ensure wallet can receive SOL

3. **RPC Configuration Security**
   - RPC URL is kept private and accessed via `/api/config`
   - No sensitive API keys exposed to client-side code

## Future Enhancements
- Bulk purchase discounts
- Creator analytics dashboard
- Marketplace search and filtering
- Rating and review system for paid content
- Export transaction history to CSV
- Advanced transaction filtering (date ranges, amounts)
- Push notifications for sales
- Marketplace revenue analytics for creators
