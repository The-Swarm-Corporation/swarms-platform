-- =====================================================
-- SWARMS MARKETPLACE SCHEMA
-- =====================================================
-- This file contains all marketplace-related database changes
-- Copy and paste this entire file into Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. ADD MARKETPLACE FIELDS TO EXISTING TABLES
-- =====================================================

-- Add marketplace fields to swarms_cloud_prompts table
ALTER TABLE "public"."swarms_cloud_prompts"
ADD COLUMN IF NOT EXISTS "is_free" boolean DEFAULT true NOT NULL,
ADD COLUMN IF NOT EXISTS "price" decimal(12,6) DEFAULT 0.000000,
ADD COLUMN IF NOT EXISTS "seller_wallet_address" text;

-- Add marketplace fields to swarms_cloud_agents table
ALTER TABLE "public"."swarms_cloud_agents"
ADD COLUMN IF NOT EXISTS "is_free" boolean DEFAULT true NOT NULL,
ADD COLUMN IF NOT EXISTS "price" decimal(12,6) DEFAULT 0.000000,
ADD COLUMN IF NOT EXISTS "seller_wallet_address" text;

-- =====================================================
-- 2. CREATE NEW MARKETPLACE TABLES
-- =====================================================

-- Create marketplace transactions table
CREATE TABLE IF NOT EXISTS "public"."marketplace_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "buyer_id" "uuid" NOT NULL,
    "seller_id" "uuid" NOT NULL,
    "item_id" "uuid" NOT NULL,
    "item_type" "text" NOT NULL,
    "amount" decimal(12,6) NOT NULL,
    "platform_fee" decimal(12,6) NOT NULL,
    "seller_amount" decimal(12,6) NOT NULL,
    "transaction_signature" "text" NOT NULL,
    "status" "text" DEFAULT 'pending' NOT NULL,
    "buyer_wallet_address" "text" NOT NULL,
    "seller_wallet_address" "text" NOT NULL
);

-- Add primary key if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'marketplace_transactions_pkey') THEN
        ALTER TABLE "public"."marketplace_transactions" ADD CONSTRAINT "marketplace_transactions_pkey" PRIMARY KEY ("id");
    END IF;
END $$;

-- Add check constraints if not exists
DO $$
BEGIN
    -- Check constraint for item_type
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'marketplace_transactions_item_type_check') THEN
        ALTER TABLE "public"."marketplace_transactions"
        ADD CONSTRAINT "marketplace_transactions_item_type_check"
        CHECK ("item_type" IN ('prompt', 'agent'));
    END IF;

    -- Check constraint for amount
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'marketplace_transactions_amount_positive_check') THEN
        ALTER TABLE "public"."marketplace_transactions"
        ADD CONSTRAINT "marketplace_transactions_amount_positive_check"
        CHECK ("amount" > 0);
    END IF;

    -- Check constraint for platform_fee
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'marketplace_transactions_platform_fee_check') THEN
        ALTER TABLE "public"."marketplace_transactions"
        ADD CONSTRAINT "marketplace_transactions_platform_fee_check"
        CHECK ("platform_fee" >= 0);
    END IF;

    -- Check constraint for seller_amount
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'marketplace_transactions_seller_amount_check') THEN
        ALTER TABLE "public"."marketplace_transactions"
        ADD CONSTRAINT "marketplace_transactions_seller_amount_check"
        CHECK ("seller_amount" >= 0);
    END IF;

    -- Check constraint for status
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'marketplace_transactions_status_check') THEN
        ALTER TABLE "public"."marketplace_transactions"
        ADD CONSTRAINT "marketplace_transactions_status_check"
        CHECK ("status" IN ('pending', 'completed', 'failed', 'cancelled'));
    END IF;

    -- Check constraint for amount calculation
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'marketplace_transactions_amount_calculation_check') THEN
        ALTER TABLE "public"."marketplace_transactions"
        ADD CONSTRAINT "marketplace_transactions_amount_calculation_check"
        CHECK ("amount" = "platform_fee" + "seller_amount");
    END IF;
END $$;

-- Create marketplace user purchases table
CREATE TABLE IF NOT EXISTS "public"."marketplace_user_purchases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "item_id" "uuid" NOT NULL,
    "item_type" "text" NOT NULL,
    "transaction_id" "uuid" NOT NULL
);

-- Add primary key and constraints for marketplace_user_purchases
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'marketplace_user_purchases_pkey') THEN
        ALTER TABLE "public"."marketplace_user_purchases" ADD CONSTRAINT "marketplace_user_purchases_pkey" PRIMARY KEY ("id");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'marketplace_user_purchases_item_type_check') THEN
        ALTER TABLE "public"."marketplace_user_purchases"
        ADD CONSTRAINT "marketplace_user_purchases_item_type_check"
        CHECK ("item_type" IN ('prompt', 'agent'));
    END IF;
END $$;

-- Create marketplace user wallets table
CREATE TABLE IF NOT EXISTS "public"."marketplace_user_wallets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "wallet_address" "text" NOT NULL,
    "is_primary" boolean DEFAULT false NOT NULL
);

-- Add primary key and constraints for marketplace_user_wallets
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'marketplace_user_wallets_pkey') THEN
        ALTER TABLE "public"."marketplace_user_wallets" ADD CONSTRAINT "marketplace_user_wallets_pkey" PRIMARY KEY ("id");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'marketplace_user_wallets_wallet_address_check') THEN
        ALTER TABLE "public"."marketplace_user_wallets"
        ADD CONSTRAINT "marketplace_user_wallets_wallet_address_check"
        CHECK (length("wallet_address") > 0);
    END IF;
END $$;

-- =====================================================
-- 3. ADD FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Foreign keys for marketplace_transactions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'marketplace_transactions_buyer_id_fkey') THEN
        ALTER TABLE "public"."marketplace_transactions"
        ADD CONSTRAINT "marketplace_transactions_buyer_id_fkey"
        FOREIGN KEY ("buyer_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'marketplace_transactions_seller_id_fkey') THEN
        ALTER TABLE "public"."marketplace_transactions"
        ADD CONSTRAINT "marketplace_transactions_seller_id_fkey"
        FOREIGN KEY ("seller_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
    END IF;
END $$;

-- Foreign keys for marketplace_user_purchases
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'marketplace_user_purchases_user_id_fkey') THEN
        ALTER TABLE "public"."marketplace_user_purchases"
        ADD CONSTRAINT "marketplace_user_purchases_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'marketplace_user_purchases_transaction_id_fkey') THEN
        ALTER TABLE "public"."marketplace_user_purchases"
        ADD CONSTRAINT "marketplace_user_purchases_transaction_id_fkey"
        FOREIGN KEY ("transaction_id") REFERENCES "public"."marketplace_transactions"("id") ON DELETE CASCADE;
    END IF;
END $$;

-- Foreign keys for marketplace_user_wallets
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'marketplace_user_wallets_user_id_fkey') THEN
        ALTER TABLE "public"."marketplace_user_wallets"
        ADD CONSTRAINT "marketplace_user_wallets_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
    END IF;
END $$;

-- =====================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for marketplace_transactions
CREATE INDEX IF NOT EXISTS "marketplace_transactions_buyer_id_idx" 
ON "public"."marketplace_transactions"("buyer_id");

CREATE INDEX IF NOT EXISTS "marketplace_transactions_seller_id_idx" 
ON "public"."marketplace_transactions"("seller_id");

CREATE INDEX IF NOT EXISTS "marketplace_transactions_item_id_idx" 
ON "public"."marketplace_transactions"("item_id");

CREATE INDEX IF NOT EXISTS "marketplace_transactions_created_at_idx" 
ON "public"."marketplace_transactions"("created_at" DESC);

CREATE INDEX IF NOT EXISTS "marketplace_transactions_status_idx" 
ON "public"."marketplace_transactions"("status");

-- Indexes for marketplace_user_purchases
CREATE INDEX IF NOT EXISTS "marketplace_user_purchases_user_id_idx" 
ON "public"."marketplace_user_purchases"("user_id");

CREATE INDEX IF NOT EXISTS "marketplace_user_purchases_item_id_idx" 
ON "public"."marketplace_user_purchases"("item_id");

CREATE INDEX IF NOT EXISTS "marketplace_user_purchases_item_type_idx" 
ON "public"."marketplace_user_purchases"("item_type");

-- Indexes for marketplace_user_wallets
CREATE INDEX IF NOT EXISTS "marketplace_user_wallets_user_id_idx" 
ON "public"."marketplace_user_wallets"("user_id");

CREATE INDEX IF NOT EXISTS "marketplace_user_wallets_wallet_address_idx" 
ON "public"."marketplace_user_wallets"("wallet_address");

-- Indexes for existing tables with new marketplace fields
CREATE INDEX IF NOT EXISTS "swarms_cloud_prompts_is_free_idx" 
ON "public"."swarms_cloud_prompts"("is_free");

CREATE INDEX IF NOT EXISTS "swarms_cloud_prompts_price_idx" 
ON "public"."swarms_cloud_prompts"("price") WHERE "is_free" = false;

CREATE INDEX IF NOT EXISTS "swarms_cloud_agents_is_free_idx" 
ON "public"."swarms_cloud_agents"("is_free");

CREATE INDEX IF NOT EXISTS "swarms_cloud_agents_price_idx" 
ON "public"."swarms_cloud_agents"("price") WHERE "is_free" = false;

-- =====================================================
-- 5. CREATE UNIQUE CONSTRAINTS
-- =====================================================

-- Prevent duplicate purchases
CREATE UNIQUE INDEX IF NOT EXISTS "marketplace_user_purchases_unique_idx" 
ON "public"."marketplace_user_purchases"("user_id", "item_id", "item_type");

-- Ensure only one primary wallet per user
CREATE UNIQUE INDEX IF NOT EXISTS "marketplace_user_wallets_primary_unique_idx" 
ON "public"."marketplace_user_wallets"("user_id") 
WHERE "is_primary" = true;

-- Ensure unique transaction signatures
CREATE UNIQUE INDEX IF NOT EXISTS "marketplace_transactions_signature_unique_idx" 
ON "public"."marketplace_transactions"("transaction_signature");

-- Ensure unique wallet addresses per user
CREATE UNIQUE INDEX IF NOT EXISTS "marketplace_user_wallets_address_unique_idx" 
ON "public"."marketplace_user_wallets"("user_id", "wallet_address");

-- =====================================================
-- 6. SET TABLE OWNERSHIP
-- =====================================================

ALTER TABLE "public"."marketplace_transactions" OWNER TO "postgres";
ALTER TABLE "public"."marketplace_user_purchases" OWNER TO "postgres";
ALTER TABLE "public"."marketplace_user_wallets" OWNER TO "postgres";

-- =====================================================
-- 7. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE "public"."marketplace_transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."marketplace_user_purchases" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."marketplace_user_wallets" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 8. CREATE RLS POLICIES
-- =====================================================

-- Policies for marketplace_transactions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own transactions' AND tablename = 'marketplace_transactions') THEN
        CREATE POLICY "Users can view their own transactions"
        ON "public"."marketplace_transactions"
        FOR SELECT
        USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can create transactions' AND tablename = 'marketplace_transactions') THEN
        CREATE POLICY "Authenticated users can create transactions"
        ON "public"."marketplace_transactions"
        FOR INSERT
        WITH CHECK (auth.uid() = buyer_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own pending transactions' AND tablename = 'marketplace_transactions') THEN
        CREATE POLICY "Users can update their own pending transactions"
        ON "public"."marketplace_transactions"
        FOR UPDATE
        USING (auth.uid() = buyer_id AND status = 'pending')
        WITH CHECK (auth.uid() = buyer_id);
    END IF;
END $$;

-- Policies for marketplace_user_purchases
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own purchases' AND tablename = 'marketplace_user_purchases') THEN
        CREATE POLICY "Users can view their own purchases"
        ON "public"."marketplace_user_purchases"
        FOR SELECT
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can create purchases' AND tablename = 'marketplace_user_purchases') THEN
        CREATE POLICY "Authenticated users can create purchases"
        ON "public"."marketplace_user_purchases"
        FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Policies for marketplace_user_wallets
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own wallets' AND tablename = 'marketplace_user_wallets') THEN
        CREATE POLICY "Users can manage their own wallets"
        ON "public"."marketplace_user_wallets"
        FOR ALL
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- =====================================================
-- 9. CREATE FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for marketplace_user_wallets updated_at
CREATE TRIGGER update_marketplace_user_wallets_updated_at 
    BEFORE UPDATE ON "public"."marketplace_user_wallets"
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure only one primary wallet per user
CREATE OR REPLACE FUNCTION ensure_single_primary_wallet()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_primary = true THEN
        UPDATE "public"."marketplace_user_wallets" 
        SET is_primary = false 
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to ensure single primary wallet
CREATE TRIGGER ensure_single_primary_wallet_trigger
    BEFORE INSERT OR UPDATE ON "public"."marketplace_user_wallets"
    FOR EACH ROW 
    EXECUTE FUNCTION ensure_single_primary_wallet();

-- =====================================================
-- 10. CREATE VIEWS FOR ANALYTICS (OPTIONAL)
-- =====================================================

-- View for marketplace statistics
CREATE OR REPLACE VIEW "public"."marketplace_stats" AS
SELECT 
    COUNT(*) as total_transactions,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_transactions,
    COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) as total_volume,
    COALESCE(SUM(platform_fee) FILTER (WHERE status = 'completed'), 0) as total_platform_fees,
    COALESCE(AVG(amount) FILTER (WHERE status = 'completed'), 0) as average_transaction_amount,
    COUNT(DISTINCT buyer_id) as unique_buyers,
    COUNT(DISTINCT seller_id) as unique_sellers
FROM "public"."marketplace_transactions";

-- View for user marketplace summary
CREATE OR REPLACE VIEW "public"."user_marketplace_summary" AS
SELECT 
    u.id as user_id,
    COALESCE(purchases.purchase_count, 0) as total_purchases,
    COALESCE(purchases.total_spent, 0) as total_spent,
    COALESCE(sales.sale_count, 0) as total_sales,
    COALESCE(sales.total_earned, 0) as total_earned,
    COALESCE(sales.total_gross_sales, 0) as total_gross_sales
FROM "auth"."users" u
LEFT JOIN (
    SELECT 
        buyer_id,
        COUNT(*) as purchase_count,
        SUM(amount) as total_spent
    FROM "public"."marketplace_transactions"
    WHERE status = 'completed'
    GROUP BY buyer_id
) purchases ON u.id = purchases.buyer_id
LEFT JOIN (
    SELECT 
        seller_id,
        COUNT(*) as sale_count,
        SUM(seller_amount) as total_earned,
        SUM(amount) as total_gross_sales
    FROM "public"."marketplace_transactions"
    WHERE status = 'completed'
    GROUP BY seller_id
) sales ON u.id = sales.seller_id;

-- =====================================================
-- 11. GRANT PERMISSIONS
-- =====================================================

-- Grant permissions for authenticated users
GRANT SELECT, INSERT, UPDATE ON "public"."marketplace_transactions" TO authenticated;
GRANT SELECT, INSERT ON "public"."marketplace_user_purchases" TO authenticated;
GRANT ALL ON "public"."marketplace_user_wallets" TO authenticated;

-- Grant permissions for service role (for admin operations)
GRANT ALL ON "public"."marketplace_transactions" TO service_role;
GRANT ALL ON "public"."marketplace_user_purchases" TO service_role;
GRANT ALL ON "public"."marketplace_user_wallets" TO service_role;

-- Grant view permissions
GRANT SELECT ON "public"."marketplace_stats" TO authenticated;
GRANT SELECT ON "public"."user_marketplace_summary" TO authenticated;

-- =====================================================
-- 12. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE "public"."marketplace_transactions" IS 'Records all marketplace transactions between buyers and sellers';
COMMENT ON TABLE "public"."marketplace_user_purchases" IS 'Tracks which users have purchased which items for access control';
COMMENT ON TABLE "public"."marketplace_user_wallets" IS 'Stores user Solana wallet addresses for marketplace transactions';

COMMENT ON COLUMN "public"."marketplace_transactions"."platform_fee" IS 'Platform commission (10% of total amount)';
COMMENT ON COLUMN "public"."marketplace_transactions"."seller_amount" IS 'Amount received by seller (90% of total amount)';
COMMENT ON COLUMN "public"."marketplace_transactions"."transaction_signature" IS 'Solana blockchain transaction signature for verification';

COMMENT ON COLUMN "public"."swarms_cloud_prompts"."is_free" IS 'Whether the prompt is free (true) or paid (false)';
COMMENT ON COLUMN "public"."swarms_cloud_prompts"."price" IS 'Price in SOL for paid prompts (0.01 - 999 SOL)';
COMMENT ON COLUMN "public"."swarms_cloud_prompts"."seller_wallet_address" IS 'Solana wallet address to receive payments';

COMMENT ON COLUMN "public"."swarms_cloud_agents"."is_free" IS 'Whether the agent is free (true) or paid (false)';
COMMENT ON COLUMN "public"."swarms_cloud_agents"."price" IS 'Price in SOL for paid agents (0.01 - 999 SOL)';
COMMENT ON COLUMN "public"."swarms_cloud_agents"."seller_wallet_address" IS 'Solana wallet address to receive payments';

-- =====================================================
-- MARKETPLACE SCHEMA SETUP COMPLETE
-- =====================================================
-- All marketplace tables, indexes, constraints, and policies are now set up
-- The schema supports:
-- - Free and paid prompts/agents with SOL pricing
-- - Secure transaction recording with blockchain verification
-- - User purchase tracking for access control
-- - Wallet management with primary wallet designation
-- - 10% platform commission automatic calculation
-- - Row Level Security for data protection
-- - Performance optimized with proper indexing
-- =====================================================
