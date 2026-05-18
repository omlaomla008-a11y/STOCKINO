-- Tech Hub : matériel recommandé & blog (contenu global du site)
CREATE TABLE IF NOT EXISTS hub_hardware_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (
    category IN ('scanners', 'imprimantes', 'consommables', 'terminaux')
  ),
  image TEXT NOT NULL,
  short_description TEXT NOT NULL,
  specs JSONB NOT NULL DEFAULT '[]'::jsonb,
  pros JSONB NOT NULL DEFAULT '[]'::jsonb,
  cons JSONB NOT NULL DEFAULT '[]'::jsonb,
  use_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
  affiliate_url TEXT NOT NULL,
  affiliate_label TEXT NOT NULL DEFAULT 'Acheter sur Amazon.fr',
  featured BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hub_blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  category TEXT,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  cover_image TEXT,
  related_hardware_slugs JSONB NOT NULL DEFAULT '[]'::jsonb,
  published BOOLEAN NOT NULL DEFAULT true,
  published_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hub_hardware_published ON hub_hardware_products (published, featured DESC, sort_order);
CREATE INDEX IF NOT EXISTS idx_hub_blog_published ON hub_blog_posts (published, published_at DESC);

ALTER TABLE hub_hardware_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique matériel publié"
  ON hub_hardware_products FOR SELECT
  TO anon, authenticated
  USING (published = true);

CREATE POLICY "Lecture publique blog publié"
  ON hub_blog_posts FOR SELECT
  TO anon, authenticated
  USING (published = true);

CREATE OR REPLACE FUNCTION hub_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS hub_hardware_updated_at ON hub_hardware_products;
CREATE TRIGGER hub_hardware_updated_at
  BEFORE UPDATE ON hub_hardware_products
  FOR EACH ROW EXECUTE FUNCTION hub_set_updated_at();

DROP TRIGGER IF EXISTS hub_blog_updated_at ON hub_blog_posts;
CREATE TRIGGER hub_blog_updated_at
  BEFORE UPDATE ON hub_blog_posts
  FOR EACH ROW EXECUTE FUNCTION hub_set_updated_at();
