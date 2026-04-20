-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roommate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viewing_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid()::text = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()::text AND u.role = 'ADMIN'
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid()::text = id);

-- ============================================================================
-- PROPERTIES TABLE POLICIES
-- ============================================================================

-- Everyone can view active properties
CREATE POLICY "Anyone can view active properties"
  ON public.properties
  FOR SELECT
  USING (isActive = true);

-- Admins can view all properties
CREATE POLICY "Admins can view all properties"
  ON public.properties
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()::text AND u.role = 'ADMIN'
    )
  );

-- Owners can create properties
CREATE POLICY "Owners can create properties"
  ON public.properties
  FOR INSERT
  WITH CHECK (ownerId = auth.uid()::text);

-- Owners can update their own properties
CREATE POLICY "Owners can update their own properties"
  ON public.properties
  FOR UPDATE
  USING (ownerId = auth.uid()::text);

-- Admins can update verification status
CREATE POLICY "Admins can update verification status"
  ON public.properties
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()::text AND u.role = 'ADMIN'
    )
  );

-- ============================================================================
-- TRANSACTIONS TABLE POLICIES
-- ============================================================================

-- Users can view their own transactions
CREATE POLICY "Users can view their own transactions"
  ON public.transactions
  FOR SELECT
  USING (payerId = auth.uid()::text);

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions"
  ON public.transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()::text AND u.role = 'ADMIN'
    )
  );

-- Anyone can insert transactions (but only for themselves - enforced by code)
CREATE POLICY "Create transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (true);

-- Transactions can be updated (M-Pesa callbacks)
CREATE POLICY "Update transactions"
  ON public.transactions
  FOR UPDATE
  USING (true);

-- ============================================================================
-- ROOMMATE PROFILES TABLE POLICIES
-- ============================================================================

-- Users can read their own roommate profile
CREATE POLICY "Users can view their own roommate profile"
  ON public.roommate_profiles
  FOR SELECT
  USING (userId = auth.uid()::text);

-- Admins can view all roommate profiles
CREATE POLICY "Admins can view all roommate profiles"
  ON public.roommate_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()::text AND u.role = 'ADMIN'
    )
  );

-- Users can insert their own roommate profile
CREATE POLICY "Users can create their own roommate profile"
  ON public.roommate_profiles
  FOR INSERT
  WITH CHECK (userId = auth.uid()::text);

-- Users can update their own roommate profile
CREATE POLICY "Users can update their own roommate profile"
  ON public.roommate_profiles
  FOR UPDATE
  USING (userId = auth.uid()::text);

-- ============================================================================
-- REVIEWS TABLE POLICIES
-- ============================================================================

-- Everyone can view reviews
CREATE POLICY "Anyone can view reviews"
  ON public.reviews
  FOR SELECT
  USING (true);

-- Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews"
  ON public.reviews
  FOR INSERT
  WITH CHECK (auth.uid()::text = authorId);

-- Authors can update their own reviews
CREATE POLICY "Authors can update their own reviews"
  ON public.reviews
  FOR UPDATE
  USING (auth.uid()::text = authorId);

-- Authors can delete their own reviews
CREATE POLICY "Authors can delete their own reviews"
  ON public.reviews
  FOR DELETE
  USING (auth.uid()::text = authorId);

-- ============================================================================
-- VIEWING REQUESTS TABLE POLICIES
-- ============================================================================

-- Users can view their own viewing requests
CREATE POLICY "Users can view their own viewing requests"
  ON public.viewing_requests
  FOR SELECT
  USING (userId = auth.uid()::text);

-- Admins can view all viewing requests
CREATE POLICY "Admins can view all viewing requests"
  ON public.viewing_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()::text AND u.role = 'ADMIN'
    )
  );

-- Authenticated users can create viewing requests
CREATE POLICY "Authenticated users can create viewing requests"
  ON public.viewing_requests
  FOR INSERT
  WITH CHECK (auth.uid()::text = userId);

-- Property owners can update viewing request status
CREATE POLICY "Property owners can update viewing request status"
  ON public.viewing_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = propertyId AND p.ownerId = auth.uid()::text
    )
  );

-- ============================================================================
-- SEARCH LOGS TABLE POLICIES
-- ============================================================================

-- Anyone can insert search logs
CREATE POLICY "Anyone can log searches"
  ON public.search_logs
  FOR INSERT
  WITH CHECK (true);
