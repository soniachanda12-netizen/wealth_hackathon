#!/bin/bash

echo "🚀 Setting up BigQuery data for Private Banking Advisor Copilot..."
echo "This will create all required tables and sample data for the dashboard."

# Create advisors table
echo "📋 Creating advisors table..."
bq query --use_legacy_sql=false "
CREATE TABLE IF NOT EXISTS \`apialchemists-1-47b9.apialchemists.advisors\` (
  advisor_id STRING,
  name STRING,
  email STRING
);
DELETE FROM \`apialchemists-1-47b9.apialchemists.advisors\` WHERE TRUE;
INSERT INTO \`apialchemists-1-47b9.apialchemists.advisors\` (advisor_id, name, email) VALUES
  ('ADV001', 'John Smith', 'john.smith@privatebank.com'),
  ('ADV002', 'Sarah Johnson', 'sarah.johnson@privatebank.com'),
  ('ADV003', 'Michael Brown', 'michael.brown@privatebank.com');
"

# Create clients table with enhanced data
echo "👥 Creating clients table..."
bq query --use_legacy_sql=false "
CREATE TABLE IF NOT EXISTS \`apialchemists-1-47b9.apialchemists.clients\` (
  client_id STRING,
  name STRING,
  email STRING,
  phone STRING,
  advisor_id STRING,
  tier STRING,
  last_contact_date DATE,
  risk_profile STRING,
  total_portfolio_value NUMERIC
);
DELETE FROM \`apialchemists-1-47b9.apialchemists.clients\` WHERE TRUE;
INSERT INTO \`apialchemists-1-47b9.apialchemists.clients\` (client_id, name, email, phone, advisor_id, tier, last_contact_date, risk_profile, total_portfolio_value) VALUES
  ('CUST001', 'Alice Smith', 'alice@example.com', '+1-555-0101', 'ADV001', 'Platinum', '2025-08-05', 'Conservative', 800000.00),
  ('CUST002', 'Bob Jones', 'bob@example.com', '+1-555-0102', 'ADV002', 'Gold', '2025-08-03', 'Moderate', 600000.00),
  ('CUST003', 'Carol White', 'carol@example.com', '+1-555-0103', 'ADV001', 'Platinum', '2025-08-01', 'Aggressive', 900000.00),
  ('CUST004', 'David Wilson', 'david@example.com', '+1-555-0104', 'ADV003', 'Silver', '2025-07-28', 'Moderate', 300000.00),
  ('CUST005', 'Emma Davis', 'emma@example.com', '+1-555-0105', 'ADV002', 'Gold', '2025-08-06', 'Conservative', 450000.00);
"

# Create accounts table
echo "🏦 Creating accounts table..."
bq query --use_legacy_sql=false "
CREATE TABLE IF NOT EXISTS \`apialchemists-1-47b9.apialchemists.accounts\` (
  account_id STRING,
  client_id STRING,
  bank_name STRING,
  account_type STRING,
  opened_date DATE
);
DELETE FROM \`apialchemists-1-47b9.apialchemists.accounts\` WHERE TRUE;
INSERT INTO \`apialchemists-1-47b9.apialchemists.accounts\` (account_id, client_id, bank_name, account_type, opened_date) VALUES
  ('ACC001', 'CUST001', 'Private Bank A', 'Investment', '2023-01-15'),
  ('ACC002', 'CUST001', 'Private Bank A', 'Savings', '2023-01-15'),
  ('ACC003', 'CUST002', 'Private Bank B', 'Investment', '2023-02-20'),
  ('ACC004', 'CUST003', 'Private Bank A', 'Investment', '2023-03-10'),
  ('ACC005', 'CUST004', 'Private Bank C', 'Investment', '2023-04-05'),
  ('ACC006', 'CUST005', 'Private Bank B', 'Savings', '2023-05-12');
"

# Create holdings table with enhanced data
echo "📈 Creating holdings table..."
bq query --use_legacy_sql=false "
CREATE TABLE IF NOT EXISTS \`apialchemists-1-47b9.apialchemists.holdings\` (
  holding_id STRING,
  client_id STRING,
  asset_class STRING,
  value NUMERIC,
  symbol STRING,
  quantity NUMERIC,
  sector STRING,
  current_price NUMERIC
);
DELETE FROM \`apialchemists-1-47b9.apialchemists.holdings\` WHERE TRUE;
INSERT INTO \`apialchemists-1-47b9.apialchemists.holdings\` (holding_id, client_id, asset_class, value, symbol, quantity, sector, current_price) VALUES
  ('H001', 'CUST001', 'Equity', 500000.00, 'AAPL', 1000.0, 'Technology', 150.00),
  ('H002', 'CUST001', 'Bond', 300000.00, 'US10Y', 300.0, 'Government', 95.50),
  ('H003', 'CUST002', 'Equity', 400000.00, 'MSFT', 800.0, 'Technology', 250.00),
  ('H004', 'CUST002', 'Real Estate', 200000.00, 'VNQ', 500.0, 'Real Estate', 85.00),
  ('H005', 'CUST003', 'Equity', 750000.00, 'GOOGL', 2500.0, 'Technology', 120.00),
  ('H006', 'CUST003', 'Bond', 150000.00, 'CORP', 150.0, 'Corporate', 98.25),
  ('H007', 'CUST004', 'Equity', 300000.00, 'SPY', 600.0, 'Index Fund', 425.00),
  ('H008', 'CUST005', 'Bond', 450000.00, 'TLT', 900.0, 'Government', 112.50);
"

# Create transactions table
echo "💳 Creating transactions table..."
bq query --use_legacy_sql=false "
CREATE TABLE IF NOT EXISTS \`apialchemists-1-47b9.apialchemists.transactions\` (
  transaction_id STRING,
  account_id STRING,
  date DATE,
  amount NUMERIC,
  category STRING
);
DELETE FROM \`apialchemists-1-47b9.apialchemists.transactions\` WHERE TRUE;
INSERT INTO \`apialchemists-1-47b9.apialchemists.transactions\` (transaction_id, account_id, date, amount, category) VALUES
  ('T001', 'ACC001', '2025-08-01', 10000.00, 'Buy'),
  ('T002', 'ACC003', '2025-08-02', -5000.00, 'Sell'),
  ('T003', 'ACC004', '2025-08-03', 15000.00, 'Buy'),
  ('T004', 'ACC001', '2025-08-04', -8000.00, 'Sell'),
  ('T005', 'ACC005', '2025-08-05', 25000.00, 'Buy'),
  ('T006', 'ACC006', '2025-08-06', 3000.00, 'Deposit');
"

# Create todo_tasks table
echo "✅ Creating todo_tasks table..."
bq query --use_legacy_sql=false "
CREATE TABLE IF NOT EXISTS \`apialchemists-1-47b9.apialchemists.todo_tasks\` (
  task STRING,
  priority INT64,
  advisor_id STRING
);
DELETE FROM \`apialchemists-1-47b9.apialchemists.todo_tasks\` WHERE TRUE;
INSERT INTO \`apialchemists-1-47b9.apialchemists.todo_tasks\` (task, priority, advisor_id) VALUES
  ('Review Alice Smith portfolio performance', 1, 'ADV001'),
  ('Call Bob Jones about rebalancing recommendations', 2, 'ADV002'),
  ('Prepare quarterly report for Carol White', 3, 'ADV001'),
  ('Schedule annual review meeting with David Wilson', 2, 'ADV003'),
  ('Send market update email to Emma Davis', 1, 'ADV002'),
  ('Analyze risk exposure for high-net-worth clients', 1, 'ADV001'),
  ('Update compliance documentation for new regulations', 3, 'ADV003'),
  ('Review investment committee recommendations', 2, 'ADV002');
"

# Create opportunities table for NBA widget
echo "🎯 Creating opportunities table..."
bq query --use_legacy_sql=false "
CREATE TABLE IF NOT EXISTS \`apialchemists-1-47b9.apialchemists.opportunities\` (
  opportunity_id STRING,
  client_id STRING,
  opportunity_type STRING,
  potential_value NUMERIC,
  confidence_score NUMERIC,
  created_date DATE
);
DELETE FROM \`apialchemists-1-47b9.apialchemists.opportunities\` WHERE TRUE;
INSERT INTO \`apialchemists-1-47b9.apialchemists.opportunities\` (opportunity_id, client_id, opportunity_type, potential_value, confidence_score, created_date) VALUES
  ('OPP001', 'CUST001', 'Portfolio Rebalancing', 25000.00, 0.85, '2025-08-07'),
  ('OPP002', 'CUST002', 'Tax Loss Harvesting', 15000.00, 0.72, '2025-08-06'),
  ('OPP003', 'CUST003', 'Alternative Investment', 50000.00, 0.91, '2025-08-05'),
  ('OPP004', 'CUST004', 'Estate Planning Review', 20000.00, 0.68, '2025-08-04'),
  ('OPP005', 'CUST005', 'Insurance Review', 12000.00, 0.79, '2025-08-03');
"

echo ""
echo "✅ BigQuery data setup complete!"
echo "📊 Created tables: advisors, clients, accounts, holdings, transactions, todo_tasks, opportunities"
echo "👥 Sample data: 3 advisors, 5 clients, 6 accounts, 8 holdings, 6 transactions, 8 tasks, 5 opportunities"
echo ""
echo "🚀 Ready to start the application:"
echo "   docker-compose up --build"
echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo ""
