
-- =========================================================
-- 1. PROFILES: visibility + display_name
-- =========================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS display_name text;

-- =========================================================
-- 2. Helper functions (SECURITY DEFINER, no recursion)
-- =========================================================
CREATE OR REPLACE FUNCTION public.is_user_visible(_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT is_visible FROM public.profiles WHERE user_id = _uid), false);
$$;

CREATE OR REPLACE FUNCTION public.users_share_course(_a uuid, _b uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_courses ua
    JOIN public.user_courses ub
      ON ua.course_code = ub.course_code
    WHERE ua.user_id = _a AND ub.user_id = _b
  );
$$;

CREATE OR REPLACE FUNCTION public.user_has_course(_uid uuid, _code text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_courses
    WHERE user_id = _uid AND course_code = _code
  );
$$;

-- =========================================================
-- 3. DM threads + messages (1-to-1)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.dm_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a uuid NOT NULL,
  user_b uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dm_threads_user_order CHECK (user_a < user_b),
  CONSTRAINT dm_threads_unique_pair UNIQUE (user_a, user_b)
);

ALTER TABLE public.dm_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "DM thread visible to participants"
  ON public.dm_threads FOR SELECT
  USING (auth.uid() IN (user_a, user_b));

CREATE POLICY "DM thread create requires both visible + shared course"
  ON public.dm_threads FOR INSERT
  WITH CHECK (
    auth.uid() IN (user_a, user_b)
    AND public.is_user_visible(user_a)
    AND public.is_user_visible(user_b)
    AND public.users_share_course(user_a, user_b)
  );

CREATE TABLE IF NOT EXISTS public.dm_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.dm_threads(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dm_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "DM messages visible to thread participants"
  ON public.dm_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.dm_threads t
      WHERE t.id = thread_id AND auth.uid() IN (t.user_a, t.user_b)
    )
  );

CREATE POLICY "DM messages insert by visible participant"
  ON public.dm_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND public.is_user_visible(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.dm_threads t
      WHERE t.id = thread_id
        AND auth.uid() IN (t.user_a, t.user_b)
        AND public.is_user_visible(t.user_a)
        AND public.is_user_visible(t.user_b)
    )
  );

-- =========================================================
-- 4. Course group chat (per course_code)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.course_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code text NOT NULL,
  user_id uuid NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.course_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Course chat readable by visible course members"
  ON public.course_chat_messages FOR SELECT
  USING (
    public.is_user_visible(auth.uid())
    AND public.user_has_course(auth.uid(), course_code)
  );

CREATE POLICY "Course chat insert by visible course member"
  ON public.course_chat_messages FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND public.is_user_visible(auth.uid())
    AND public.user_has_course(auth.uid(), course_code)
  );

CREATE INDEX IF NOT EXISTS idx_course_chat_course_code ON public.course_chat_messages(course_code, created_at);
CREATE INDEX IF NOT EXISTS idx_dm_messages_thread ON public.dm_messages(thread_id, created_at);

-- =========================================================
-- 5. Book listings
-- =========================================================
CREATE TABLE IF NOT EXISTS public.book_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_user_id uuid NOT NULL,
  course_code text NOT NULL,
  title text NOT NULL,
  description text,
  condition text NOT NULL DEFAULT 'good',
  price_sek numeric(10,2) NOT NULL CHECK (price_sek > 0),
  image_url text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('draft','active','reserved','sold','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_book_listings_course ON public.book_listings(course_code, status);
CREATE INDEX IF NOT EXISTS idx_book_listings_seller ON public.book_listings(seller_user_id);

ALTER TABLE public.book_listings ENABLE ROW LEVEL SECURITY;

-- Seller can fully manage own listings
CREATE POLICY "Seller manages own listings"
  ON public.book_listings FOR SELECT
  USING (seller_user_id = auth.uid());

CREATE POLICY "Seller inserts own listing"
  ON public.book_listings FOR INSERT
  WITH CHECK (seller_user_id = auth.uid());

CREATE POLICY "Seller updates own listing"
  ON public.book_listings FOR UPDATE
  USING (seller_user_id = auth.uid())
  WITH CHECK (seller_user_id = auth.uid());

CREATE POLICY "Seller deletes own listing"
  ON public.book_listings FOR DELETE
  USING (seller_user_id = auth.uid());

-- Buyers see active listings (but app MUST use the public view to hide seller)
CREATE POLICY "Active listings visible to authenticated"
  ON public.book_listings FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND status IN ('active','reserved','sold')
  );

CREATE TRIGGER trg_book_listings_updated_at
  BEFORE UPDATE ON public.book_listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Public-safe view: hides seller_user_id (anonymity)
CREATE OR REPLACE VIEW public.public_book_listings
WITH (security_invoker = on) AS
SELECT
  id,
  course_code,
  title,
  description,
  condition,
  price_sek,
  image_url,
  status,
  created_at
FROM public.book_listings
WHERE status IN ('active','reserved','sold');

GRANT SELECT ON public.public_book_listings TO authenticated, anon;

-- =========================================================
-- 6. Book orders
-- =========================================================
CREATE TABLE IF NOT EXISTS public.book_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.book_listings(id) ON DELETE RESTRICT,
  buyer_user_id uuid NOT NULL,
  seller_user_id uuid NOT NULL,
  gross_amount_sek numeric(10,2) NOT NULL CHECK (gross_amount_sek > 0),
  platform_fee_sek numeric(10,2) NOT NULL,
  seller_net_sek numeric(10,2) NOT NULL,
  swish_reference text,
  payment_status text NOT NULL DEFAULT 'awaiting_payment'
    CHECK (payment_status IN ('awaiting_payment','payment_confirmed','released','refunded','failed')),
  order_status text NOT NULL DEFAULT 'pending'
    CHECK (order_status IN ('pending','paid','delivered','completed','cancelled')),
  buyer_confirmed_delivery_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON public.book_orders(buyer_user_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON public.book_orders(seller_user_id);
CREATE INDEX IF NOT EXISTS idx_orders_listing ON public.book_orders(listing_id);

ALTER TABLE public.book_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Order visible to buyer or seller"
  ON public.book_orders FOR SELECT
  USING (auth.uid() IN (buyer_user_id, seller_user_id));

-- Buyer creates the order. Fee math is enforced by trigger below.
CREATE POLICY "Buyer creates order for active listing"
  ON public.book_orders FOR INSERT
  WITH CHECK (
    buyer_user_id = auth.uid()
    AND buyer_user_id <> seller_user_id
    AND EXISTS (
      SELECT 1 FROM public.book_listings l
      WHERE l.id = listing_id
        AND l.status = 'active'
        AND l.seller_user_id = book_orders.seller_user_id
        AND l.price_sek = book_orders.gross_amount_sek
    )
  );

CREATE POLICY "Buyer or seller can update order"
  ON public.book_orders FOR UPDATE
  USING (auth.uid() IN (buyer_user_id, seller_user_id))
  WITH CHECK (auth.uid() IN (buyer_user_id, seller_user_id));

CREATE TRIGGER trg_book_orders_updated_at
  BEFORE UPDATE ON public.book_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Server-side fee calculation + listing reservation
CREATE OR REPLACE FUNCTION public.handle_new_book_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Always recompute platform fee 10% (round to 2 decimals)
  NEW.platform_fee_sek := round(NEW.gross_amount_sek * 0.10, 2);
  NEW.seller_net_sek := NEW.gross_amount_sek - NEW.platform_fee_sek;

  -- Atomically reserve the listing; fail if not active
  UPDATE public.book_listings
     SET status = 'reserved', updated_at = now()
   WHERE id = NEW.listing_id AND status = 'active';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Boken är inte längre tillgänglig';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_book_orders_before_insert
  BEFORE INSERT ON public.book_orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_book_order();

-- Sync listing status when order changes
CREATE OR REPLACE FUNCTION public.sync_listing_on_order_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.order_status = 'completed' OR NEW.payment_status = 'released' THEN
    UPDATE public.book_listings SET status = 'sold', updated_at = now()
      WHERE id = NEW.listing_id;
  ELSIF NEW.order_status = 'cancelled' OR NEW.payment_status IN ('failed','refunded') THEN
    UPDATE public.book_listings SET status = 'active', updated_at = now()
      WHERE id = NEW.listing_id AND status = 'reserved';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_book_orders_after_update
  AFTER UPDATE ON public.book_orders
  FOR EACH ROW EXECUTE FUNCTION public.sync_listing_on_order_change();

-- =========================================================
-- 7. Order chat (opens after payment_confirmed)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.order_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.book_orders(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_messages_order ON public.order_messages(order_id, created_at);

ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.order_is_unlocked(_order_id uuid, _uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.book_orders o
    WHERE o.id = _order_id
      AND _uid IN (o.buyer_user_id, o.seller_user_id)
      AND o.payment_status IN ('payment_confirmed','released')
  );
$$;

CREATE POLICY "Order chat visible only after payment confirmed"
  ON public.order_messages FOR SELECT
  USING (public.order_is_unlocked(order_id, auth.uid()));

CREATE POLICY "Order chat insert only after payment confirmed"
  ON public.order_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND public.order_is_unlocked(order_id, auth.uid())
  );

-- =========================================================
-- 8. Storage bucket for book images
-- =========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-images', 'book-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Book images publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'book-images');

CREATE POLICY "Authenticated can upload book images to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'book-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Owner can update own book images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'book-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Owner can delete own book images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'book-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- =========================================================
-- 9. Visible profiles helper view
-- =========================================================
CREATE OR REPLACE VIEW public.visible_profiles
WITH (security_invoker = on) AS
SELECT
  p.user_id,
  p.display_name,
  p.program_name
FROM public.profiles p
WHERE p.is_visible = true
  AND public.is_user_visible(auth.uid());

GRANT SELECT ON public.visible_profiles TO authenticated;
