CREATE TABLE IF NOT EXISTS enquiries (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  company TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  project_type TEXT NOT NULL,
  budget TEXT NOT NULL,
  timeline TEXT NOT NULL,
  details TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  status TEXT NOT NULL DEFAULT 'New'
    CHECK (status IN ('New', 'In progress', 'Closed'))
);

CREATE INDEX IF NOT EXISTS enquiries_created_at_idx
  ON enquiries (created_at DESC);

CREATE INDEX IF NOT EXISTS enquiries_status_idx
  ON enquiries (status);
