
CREATE TABLE IF NOT EXISTS block_header (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  compact_target TEXT NOT NULL,
  dao TEXT NOT NULL,
  epoch TEXT NOT NULL,
  extra_hash TEXT NOT NULL,
  block_hash TEXT UNIQUE NOT NULL,
  nonce TEXT NOT NULL,
  block_number TEXT NOT NULL,
  parent_hash TEXT NOT NULL,
  proposals_hash TEXT NOT NULL,
  timestamp DATETIME NOT NULL,
  transactions_root TEXT NOT NULL,
  version TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tx_hash TEXT UNIQUE NOT NULL,
    cycles TEXT,
    size TEXT,
    fee TEXT,
    version TEXT,
    witnesses TEXT NOT NULL,
    type TEXT, -- tx type, eg: ckb transfer, udt transfer or any other known type
    status INTEGER NOT NULL, -- 0: pending, 1: proposing, 2: proposed, 3: committed, 4: rejected
    enter_pool_at DATETIME, -- the timestamp of the tx first seem in pool
    proposing_at DATETIME, -- the timestamp of the tx first proposed in mempool
    proposed_at DATETIME,
    proposed_at_block_hash TEXT,
    proposed_at_block_number TEXT,
    committed_at DATETIME,
    committed_at_block_hash TEXT,
    committed_at_block_number TEXT,
    rejected_at DATETIME,
    rejected_reason TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cell_dep (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL,
    o_tx_hash TEXT NOT NULL, -- output tx hash
    o_index INTEGER NOT NULL, -- output index
    dep_type INTEGER NOT NULL, -- 0: code, 1: dep
    FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

CREATE TABLE IF NOT EXISTS header_dep (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL,
    header_hash TEXT NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

CREATE TABLE IF NOT EXISTS script (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code_hash TEXT NOT NULL,
    hash_type INTEGER NOT NULL,
    args TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS input (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL,
    previous_output_tx_hash TEXT NOT NULL,
    previous_output_index INTEGER NOT NULL,
    since TEXT NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

CREATE TABLE IF NOT EXISTS output (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL,
    capacity TEXT NOT NULL,
    lock_script_id INTEGER NOT NULL,
    type_script_id INTEGER,
    o_data TEXT NOT NULL, -- output data
    FOREIGN KEY (transaction_id) REFERENCES transactions(id),
    FOREIGN KEY (lock_script_id) REFERENCES script(id),
    FOREIGN KEY (type_script_id) REFERENCES script(id)
);

-- create index on tables
-- block_number on block_header
CREATE INDEX IF NOT EXISTS idx_block_header_block_number ON block_header (block_number);

-- tx_hash on transactions
CREATE INDEX IF NOT EXISTS idx_transactions_tx_hash ON transactions (tx_hash);

-- status on transactions
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions (status);

-- proposed_at_block_number on transactions
CREATE INDEX IF NOT EXISTS idx_transactions_proposed_at_block_number ON transactions (proposed_at_block_number);

-- committed_at_block_number on transactions
CREATE INDEX IF NOT EXISTS idx_transactions_committed_at_block_number ON transactions (committed_at_block_number);

-- outpoint on input 
CREATE INDEX IF NOT EXISTS idx_input_outpoint ON input (previous_output_tx_hash, previous_output_index);
