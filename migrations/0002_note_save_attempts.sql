CREATE TABLE IF NOT EXISTS note_save_attempts (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE, payload_hash TEXT NOT NULL, state TEXT NOT NULL CHECK(state IN ('pending', 'saved', 'failed')), created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS note_attempts_owner_idx ON note_save_attempts(user_id);
