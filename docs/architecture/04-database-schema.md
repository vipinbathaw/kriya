# Database Schema

> Source of truth: the Knex migrations in `server/migrations/` (which are applied in order `20240101000001` → `20240101000015`).

## Entity Relationship Overview

```
users ──────┬──── refresh_tokens
            ├──── user_settings
            ├──── api_keys
            ├──── user_ai_configs
            ├──── notes ──────────── note_tags
            ├──── finance_entries ── finance_tags
            └──── nutrition_entries ── nutrition_items
```

`ai_providers` is reference/seed data (no user relation).

## Tables

### users
```sql
CREATE TABLE users (
  id                CHAR(36) PRIMARY KEY,          -- UUID v4
  email             VARCHAR(255) NOT NULL UNIQUE,
  password_hash     VARCHAR(255) NOT NULL,
  display_name      VARCHAR(100) NOT NULL,
  avatar_url        VARCHAR(500),
  email_verified    BOOLEAN DEFAULT FALSE,
  email_verify_token VARCHAR(255),
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### refresh_tokens
```sql
CREATE TABLE refresh_tokens (
  id         CHAR(36) PRIMARY KEY,
  user_id    CHAR(36) NOT NULL,
  token_hash VARCHAR(64) NOT NULL,                 -- sha256 of the refresh token
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_refresh_tokens_user_id (user_id)
);
```
Refresh tokens are single-use: the stored row is deleted when a new token is issued or on logout.

### user_settings
```sql
CREATE TABLE user_settings (
  id         CHAR(36) PRIMARY KEY,
  user_id    CHAR(36) NOT NULL UNIQUE,
  theme      ENUM('light', 'dark', 'system') DEFAULT 'system',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### notes
```sql
CREATE TABLE notes (
  id          CHAR(36) PRIMARY KEY,
  user_id     CHAR(36) NOT NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  tags        JSON,                                -- Cached tag array for quick display
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notes_user_created (user_id, created_at)
);
```

### note_tags
```sql
CREATE TABLE note_tags (
  id      CHAR(36) PRIMARY KEY,
  note_id CHAR(36) NOT NULL,
  tag     VARCHAR(100) NOT NULL,
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  INDEX idx_note_tags_note_id (note_id),
  INDEX idx_note_tags_tag (tag)
);
```

### finance_entries
```sql
CREATE TABLE finance_entries (
  id          CHAR(36) PRIMARY KEY,
  user_id     CHAR(36) NOT NULL,
  type        ENUM('credit', 'debit') NOT NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  amount      BIGINT NOT NULL,                     -- Stored in smallest unit (paise/cents)
  currency    VARCHAR(3) DEFAULT 'INR',
  tags        JSON,
  entry_date  DATE NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_finance_user_date (user_id, entry_date),
  INDEX idx_finance_user_type (user_id, type)
);
```

### finance_tags
```sql
CREATE TABLE finance_tags (
  id               CHAR(36) PRIMARY KEY,
  finance_entry_id CHAR(36) NOT NULL,
  tag              VARCHAR(100) NOT NULL,
  FOREIGN KEY (finance_entry_id) REFERENCES finance_entries(id) ON DELETE CASCADE,
  INDEX idx_finance_tags_entry_id (finance_entry_id),
  INDEX idx_finance_tags_tag (tag)
);
```

### nutrition_entries
```sql
CREATE TABLE nutrition_entries (
  id            CHAR(36) PRIMARY KEY,
  user_id       CHAR(36) NOT NULL,
  raw_input     TEXT NOT NULL,                     -- "1 serving kadhai paneer, 4 roti"
  meal_type     ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
  entry_date    DATE NOT NULL,
  ai_generated  BOOLEAN DEFAULT TRUE,              -- Always true for nutrition (AI mandatory)
  status        ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  error_message TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_nutrition_user_date (user_id, entry_date),
  INDEX idx_nutrition_status (status)
);
```
Nutrition entries start as `pending`; the background worker (`nutrition-queue.service.ts`) parses them via the AI provider and flips status to `completed` (with items) or `failed` (with `error_message`).

### nutrition_items
```sql
CREATE TABLE nutrition_items (
  id                   CHAR(36) PRIMARY KEY,
  nutrition_entry_id   CHAR(36) NOT NULL,
  food_name            VARCHAR(255) NOT NULL,
  quantity             DECIMAL(10, 2),
  unit                 VARCHAR(50),                -- serving, piece, cup, g, ml
  calories             DECIMAL(10, 2),
  protein_g            DECIMAL(10, 2),
  carbs_g              DECIMAL(10, 2),
  fat_g                DECIMAL(10, 2),
  fiber_g              DECIMAL(10, 2),
  sugar_g              DECIMAL(10, 2),
  sodium_mg            DECIMAL(10, 2),
  -- 21 micro-nutrients (added by migration 13), all DECIMAL(10,2) DEFAULT 0:
  saturated_fat_g, trans_fat_g, monounsaturated_fat_g, polyunsaturated_fat_g,
  cholesterol_mg, potassium_mg, calcium_mg, iron_mg,
  vitamin_a_iug, vitamin_c_mg, vitamin_d_iug, vitamin_e_mg, vitamin_k_iug,
  vitamin_b6_mg, vitamin_b12_iug, folate_iug,
  magnesium_mg, zinc_mg, phosphorus_mg, selenium_iug, copper_mg, manganese_mg,
  metadata             JSON,                       -- Any additional AI-generated fields
  FOREIGN KEY (nutrition_entry_id) REFERENCES nutrition_entries(id) ON DELETE CASCADE,
  INDEX idx_nutrition_items_entry_id (nutrition_entry_id)
);
```

### api_keys
```sql
CREATE TABLE api_keys (
  id             CHAR(36) PRIMARY KEY,
  user_id        CHAR(36) NOT NULL,
  provider       VARCHAR(50) NOT NULL,             -- 'openai', 'anthropic', etc.
  encrypted_key  TEXT NOT NULL,                    -- JSON {ciphertext, iv, authTag} (AES-256-GCM)
  key_preview    VARCHAR(20) NOT NULL,             -- First 8 chars for user recognition: "sk-proj-..."
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_provider (user_id, provider)
);
```
The GCM IV and auth tag are stored inside the single `encrypted_key` JSON payload, not as separate columns.

### ai_providers
```sql
CREATE TABLE ai_providers (
  id         VARCHAR(50) PRIMARY KEY,              -- 'openai', 'anthropic', 'mock'
  name       VARCHAR(100) NOT NULL,
  models     JSON NOT NULL,                        -- Available models for this provider
  is_active  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data (migration 20240101000010, plus 20240101000016 for DeepSeek)
INSERT INTO ai_providers (id, name, models) VALUES
('openai',    'OpenAI',                    '["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"]'),
('anthropic', 'Anthropic',                 '["claude-sonnet-4-20250514", "claude-haiku-3-5-20241022"]'),
('mock',      'Mock AI (Development)',     '["mock"]'),
('deepseek',  'DeepSeek',                  '["deepseek-v4-flash", "deepseek-v4-pro"]');
```

### user_ai_configs
```sql
CREATE TABLE user_ai_configs (
  id         CHAR(36) PRIMARY KEY,
  user_id    CHAR(36) NOT NULL,
  module     ENUM('notes', 'finance', 'nutrition') NOT NULL,
  ai_enabled BOOLEAN DEFAULT FALSE,
  provider   VARCHAR(50),                          -- References ai_providers.id
  model      VARCHAR(100),                         -- Selected model for this provider
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_module (user_id, module)
);
```

## Indexing Strategy
- All foreign keys indexed
- All `user_id` columns indexed (primary access pattern)
- Composite indexes for the primary list queries: `(user_id, created_at)` on notes, `(user_id, entry_date)` on finance and nutrition
- `(user_id, type)` on finance for credit/debit filtering
- Tag columns (`note_tags.tag`, `finance_tags.tag`) indexed for tag search
- `nutrition_entries.status` indexed for the queue worker

## Migration Strategy
- Knex.js migrations for schema changes
- Each migration is a single file with `up` and `down` methods
- Naming convention: `YYYYMMDDHHMMSS_description.ts`
- `ai_providers` is seeded inside the migration itself (migration 10)
- Seeds (`server/seeds/`) contain development-only reference users
