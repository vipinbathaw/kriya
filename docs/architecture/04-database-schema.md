# Database Schema

## Entity Relationship Overview

```
users ──────┬──── notes
            ├──── note_tags
            ├──── finance_entries ──── finance_tags
            ├──── nutrition_entries ── nutrition_items
            ├──── api_keys
            ├──── user_ai_configs
            └──── user_settings
```

## Tables

### users
```sql
CREATE TABLE users (
  id            CHAR(36) PRIMARY KEY,           -- UUID v4
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name  VARCHAR(100),
  avatar_url    VARCHAR(500),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### notes
```sql
CREATE TABLE notes (
  id          CHAR(36) PRIMARY KEY,
  user_id     CHAR(36) NOT NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  tags        JSON,                             -- Cached tag array for quick display
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notes_user_id (user_id),
  INDEX idx_notes_created_at (created_at)
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
  INDEX idx_note_tags_tag (tag),
  UNIQUE KEY uq_note_tag (note_id, tag)
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
  amount      BIGINT NOT NULL,                  -- Stored in smallest unit (paise/cents)
  currency    VARCHAR(3) DEFAULT 'INR',
  tags        JSON,
  entry_date  DATE NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_finance_user_id (user_id),
  INDEX idx_finance_entry_date (entry_date),
  INDEX idx_finance_type (type)
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
  INDEX idx_finance_tags_tag (tag),
  UNIQUE KEY uq_finance_entry_tag (finance_entry_id, tag)
);
```

### nutrition_entries
```sql
CREATE TABLE nutrition_entries (
  id              CHAR(36) PRIMARY KEY,
  user_id         CHAR(36) NOT NULL,
  raw_input       TEXT NOT NULL,                -- "1 serving kadhai paneer, 4 roti"
  meal_type       ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
  entry_date      DATE NOT NULL,
  ai_generated    BOOLEAN DEFAULT TRUE,         -- Always true for nutrition (AI mandatory)
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_nutrition_user_id (user_id),
  INDEX idx_nutrition_entry_date (entry_date)
);
```

### nutrition_items
```sql
CREATE TABLE nutrition_items (
  id                CHAR(36) PRIMARY KEY,
  nutrition_entry_id CHAR(36) NOT NULL,
  food_name         VARCHAR(255) NOT NULL,
  quantity          DECIMAL(10, 2),
  unit              VARCHAR(50),                 -- serving, piece, cup, g, ml
  calories          DECIMAL(10, 2),
  protein_g         DECIMAL(10, 2),
  carbs_g           DECIMAL(10, 2),
  fat_g             DECIMAL(10, 2),
  fiber_g           DECIMAL(10, 2),
  sugar_g           DECIMAL(10, 2),
  sodium_mg         DECIMAL(10, 2),
  metadata          JSON,                        -- Any additional AI-generated fields
  FOREIGN KEY (nutrition_entry_id) REFERENCES nutrition_entries(id) ON DELETE CASCADE,
  INDEX idx_nutrition_items_entry_id (nutrition_entry_id)
);
```

### api_keys
```sql
CREATE TABLE api_keys (
  id            CHAR(36) PRIMARY KEY,
  user_id       CHAR(36) NOT NULL,
  provider      VARCHAR(50) NOT NULL,           -- 'openai', 'anthropic', etc.
  encrypted_key TEXT NOT NULL,                  -- AES-256-GCM ciphertext
  encryption_iv VARCHAR(64) NOT NULL,           -- Initialization vector
  encryption_tag VARCHAR(64) NOT NULL,          -- Auth tag
  key_preview   VARCHAR(20) NOT NULL,           -- First 8 chars for user recognition: "sk-proj-..."
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_provider (user_id, provider),
  INDEX idx_api_keys_user_id (user_id)
);
```

### ai_providers
```sql
CREATE TABLE ai_providers (
  id          VARCHAR(50) PRIMARY KEY,          -- 'openai', 'anthropic', 'google-ai'
  name        VARCHAR(100) NOT NULL,
  base_url    VARCHAR(500),                     -- Custom API endpoint
  models      JSON,                             -- Available models for this provider
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data
INSERT INTO ai_providers (id, name, base_url, models) VALUES
('openai', 'OpenAI', 'https://api.openai.com/v1', '["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"]'),
('anthropic', 'Anthropic', 'https://api.anthropic.com/v1', '["claude-sonnet-4-20250514", "claude-haiku-3-5-20241022"]');
```

### user_ai_configs
```sql
CREATE TABLE user_ai_configs (
  id            CHAR(36) PRIMARY KEY,
  user_id       CHAR(36) NOT NULL,
  module        ENUM('notes', 'finance', 'nutrition') NOT NULL,
  ai_enabled    BOOLEAN DEFAULT FALSE,
  provider      VARCHAR(50),                     -- References ai_providers.id
  model         VARCHAR(100),                    -- Selected model for this provider
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_module (user_id, module),
  INDEX idx_ai_configs_user_id (user_id)
);
```

### user_settings
```sql
CREATE TABLE user_settings (
  id              CHAR(36) PRIMARY KEY,
  user_id         CHAR(36) NOT NULL UNIQUE,
  theme           ENUM('light', 'dark', 'system') DEFAULT 'system',
  default_currency VARCHAR(3) DEFAULT 'INR',
  timezone        VARCHAR(50) DEFAULT 'UTC',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Indexing Strategy
- All foreign keys indexed
- All `user_id` columns indexed (primary access pattern)
- `entry_date` columns indexed for date-range queries
- Composite indexes for common queries: `(user_id, created_at)`, `(user_id, entry_date)`
- Tag columns indexed for search

## Migration Strategy
- Knex.js migrations for schema changes
- Each migration is a single file with `up` and `down` methods
- Naming convention: `YYYYMMDDHHMMSS_description.ts`
- Seeds for reference data (ai_providers)
