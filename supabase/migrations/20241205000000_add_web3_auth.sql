-- Add Web3 authentication support to the platform

-- Enable Web3 auth provider
INSERT INTO auth.providers (name, enabled)
VALUES ('web3', true)
ON CONFLICT (name) DO UPDATE SET enabled = true;

-- Create backup of users table before modifications
CREATE TABLE IF NOT EXISTS users_backup AS SELECT * FROM users;

-- Add wallet address and auth method to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS wallet_address TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS auth_method TEXT DEFAULT 'oauth',
ADD COLUMN IF NOT EXISTS wallet_type TEXT DEFAULT 'solana';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_auth_method ON users(auth_method);

-- Create Web3 auth sessions table for nonce management
CREATE TABLE IF NOT EXISTS web3_auth_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  nonce TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create auth analytics table for tracking authentication attempts
CREATE TABLE IF NOT EXISTS auth_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_method TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  wallet_type TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for Web3 auth sessions
CREATE INDEX IF NOT EXISTS idx_web3_auth_wallet ON web3_auth_sessions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_web3_auth_nonce ON web3_auth_sessions(nonce);
CREATE INDEX IF NOT EXISTS idx_web3_auth_expires ON web3_auth_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_web3_auth_used ON web3_auth_sessions(used);

-- Add RLS policies for Web3 auth sessions
ALTER TABLE web3_auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_analytics ENABLE ROW LEVEL SECURITY;

-- Only allow service role to manage Web3 auth sessions (for security)
CREATE POLICY "Service role can manage web3 auth sessions" ON web3_auth_sessions
  FOR ALL USING (auth.role() = 'service_role');

-- Only allow service role to manage auth analytics
CREATE POLICY "Service role can manage auth analytics" ON auth_analytics
  FOR ALL USING (auth.role() = 'service_role');

-- Function to clean up expired Web3 nonces
CREATE OR REPLACE FUNCTION cleanup_expired_web3_nonces()
RETURNS void AS $$
BEGIN
  DELETE FROM web3_auth_sessions 
  WHERE expires_at < NOW() OR used = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_new_user function to support Web3 auth
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  BEGIN
    INSERT INTO public.users (
      id, 
      full_name, 
      avatar_url, 
      email,
      wallet_address,
      auth_method,
      wallet_type
    )
    VALUES (
      new.id, 
      COALESCE(new.raw_user_meta_data->>'full_name', ''),
      COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
      COALESCE(new.email, ''),
      COALESCE(new.raw_user_meta_data->>'wallet_address', null),
      CASE 
        WHEN new.raw_user_meta_data->>'wallet_address' IS NOT NULL THEN 'web3'
        ELSE 'oauth'
      END,
      COALESCE(new.raw_user_meta_data->>'wallet_type', 'solana')
    );
  EXCEPTION WHEN others THEN
    RAISE WARNING 'Failed to create user record for %: %', new.id, SQLERRM;
    RETURN new;
  END;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY definer;

-- Add constraint to ensure wallet addresses are valid (basic check)
ALTER TABLE users ADD CONSTRAINT valid_wallet_address 
  CHECK (wallet_address IS NULL OR length(wallet_address) >= 32);

-- Add constraint for auth method
ALTER TABLE users ADD CONSTRAINT valid_auth_method 
  CHECK (auth_method IN ('oauth', 'web3'));

-- Add constraint for wallet type
ALTER TABLE users ADD CONSTRAINT valid_wallet_type 
  CHECK (wallet_type IN ('solana'));

-- Grant necessary permissions
GRANT ALL ON TABLE web3_auth_sessions TO service_role;
GRANT ALL ON TABLE auth_analytics TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_expired_web3_nonces() TO service_role;

-- Add comment for documentation
COMMENT ON TABLE web3_auth_sessions IS 'Stores temporary nonces for Web3 wallet authentication';
COMMENT ON TABLE auth_analytics IS 'Tracks authentication attempts and success rates for analytics';
COMMENT ON COLUMN users.wallet_address IS 'Solana wallet address for Web3 authentication';
COMMENT ON COLUMN users.auth_method IS 'Authentication method used: oauth or web3';
COMMENT ON COLUMN users.wallet_type IS 'Type of wallet: currently only solana supported';
