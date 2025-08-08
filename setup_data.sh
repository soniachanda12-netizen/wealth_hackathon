#!/bin/bash

# Private Banking Advisor Copilot - Data Setup Script
# This script sets up all required BigQuery tables with comprehensive sample data

set -e

# Configuration
PROJECT_ID="apialchemists-1-47b9"
DATASET_NAME="apialchemists"
LOCATION="us-central1"

echo "🏦 Private Banking Advisor Copilot - Data Setup"
echo "================================================"
echo "Project ID: $PROJECT_ID"
echo "Dataset: $DATASET_NAME"
echo "Location: $LOCATION"
echo ""

# Check if user is authenticated
echo "🔐 Checking authentication..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n1 > /dev/null; then
    echo "❌ Not authenticated. Please run: gcloud auth login"
    exit 1
fi

CURRENT_USER=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n1)
echo "✅ Authenticated as: $CURRENT_USER"
echo ""

# Verify project access
echo "🌐 Verifying project access..."
if ! gcloud projects describe $PROJECT_ID > /dev/null 2>&1; then
    echo "❌ Cannot access project $PROJECT_ID. Please check your permissions."
    exit 1
fi
echo "✅ Project access verified"
echo ""

# Create dataset if it doesn't exist
echo "📊 Setting up BigQuery dataset..."
if ! bq ls --project_id=$PROJECT_ID | grep -q "$DATASET_NAME"; then
    echo "Creating dataset: $DATASET_NAME"
    bq mk --dataset --location=$LOCATION $PROJECT_ID:$DATASET_NAME
else
    echo "✅ Dataset already exists: $DATASET_NAME"
fi
echo ""

# Function to create table with data
create_table_with_data() {
    local table_name=$1
    local schema_and_data=$2
    
    echo "📋 Setting up table: $table_name"
    
    # Execute the BigQuery command
    if bq query --use_legacy_sql=false --project_id=$PROJECT_ID "$schema_and_data"; then
        echo "✅ Table $table_name created successfully"
    else
        echo "❌ Failed to create table $table_name"
        return 1
    fi
    echo ""
}

# 1. Create advisors table
create_table_with_data "advisors" "
DROP TABLE IF EXISTS \`$PROJECT_ID.$DATASET_NAME.advisors\`;

CREATE TABLE \`$PROJECT_ID.$DATASET_NAME.advisors\` (
  advisor_id STRING,
  name STRING,
  email STRING,
  specialization STRING,
  years_experience INT64,
  location STRING
);

INSERT INTO \`$PROJECT_ID.$DATASET_NAME.advisors\` 
(advisor_id, name, email, specialization, years_experience, location) VALUES
  ('ADV001', 'John Smith', 'john.smith@privatebank.com', 'Wealth Management', 15, 'New York'),
  ('ADV002', 'Sarah Johnson', 'sarah.johnson@privatebank.com', 'Portfolio Strategy', 12, 'London'),
  ('ADV003', 'Michael Brown', 'michael.brown@privatebank.com', 'Alternative Investments', 18, 'Singapore'),
  ('ADV004', 'Emma Davis', 'emma.davis@privatebank.com', 'Family Office Services', 10, 'Zurich'),
  ('ADV005', 'David Wilson', 'david.wilson@privatebank.com', 'ESG Investing', 8, 'Dubai');
"

# 2. Create clients table
create_table_with_data "clients" "
DROP TABLE IF EXISTS \`$PROJECT_ID.$DATASET_NAME.clients\`;

CREATE TABLE \`$PROJECT_ID.$DATASET_NAME.clients\` (
  client_id STRING,
  name STRING,
  email STRING,
  phone STRING,
  advisor_id STRING,
  client_tier STRING,
  net_worth NUMERIC,
  risk_tolerance STRING,
  investment_objective STRING,
  location STRING,
  onboarding_date DATE
);

INSERT INTO \`$PROJECT_ID.$DATASET_NAME.clients\` 
(client_id, name, email, phone, advisor_id, client_tier, net_worth, risk_tolerance, investment_objective, location, onboarding_date) VALUES
  ('CUST001', 'Alice Smith', 'alice@example.com', '+1-555-0101', 'ADV001', 'Platinum', 5000000.00, 'Moderate', 'Growth', 'New York', '2023-01-15'),
  ('CUST002', 'Bob Jones', 'bob@example.com', '+1-555-0102', 'ADV002', 'Gold', 2500000.00, 'Conservative', 'Income', 'Boston', '2023-02-20'),
  ('CUST003', 'Carol White', 'carol@example.com', '+1-555-0103', 'ADV001', 'Platinum', 8000000.00, 'Aggressive', 'Growth', 'San Francisco', '2023-03-10'),
  ('CUST004', 'David Wilson', 'david@example.com', '+1-555-0104', 'ADV003', 'Silver', 1500000.00, 'Moderate', 'Balanced', 'Chicago', '2023-04-05'),
  ('CUST005', 'Emma Davis', 'emma@example.com', '+1-555-0105', 'ADV002', 'Gold', 3200000.00, 'Conservative', 'Capital Preservation', 'Miami', '2023-05-12'),
  ('CUST006', 'Frank Miller', 'frank@example.com', '+1-555-0106', 'ADV003', 'Platinum', 12000000.00, 'Moderate', 'Diversification', 'Los Angeles', '2023-06-18'),
  ('CUST007', 'Grace Taylor', 'grace@example.com', '+1-555-0107', 'ADV004', 'Gold', 4500000.00, 'Aggressive', 'Growth', 'Seattle', '2023-07-22'),
  ('CUST008', 'Henry Brown', 'henry@example.com', '+1-555-0108', 'ADV005', 'Silver', 2100000.00, 'Conservative', 'ESG Focus', 'Denver', '2023-08-01');
"

# 3. Create accounts table
create_table_with_data "accounts" "
DROP TABLE IF EXISTS \`$PROJECT_ID.$DATASET_NAME.accounts\`;

CREATE TABLE \`$PROJECT_ID.$DATASET_NAME.accounts\` (
  account_id STRING,
  client_id STRING,
  bank_name STRING,
  account_type STRING,
  opened_date DATE,
  balance NUMERIC,
  currency STRING,
  status STRING
);

INSERT INTO \`$PROJECT_ID.$DATASET_NAME.accounts\` 
(account_id, client_id, bank_name, account_type, opened_date, balance, currency, status) VALUES
  ('ACC001', 'CUST001', 'Private Bank A', 'Investment', '2023-01-15', 2500000.00, 'USD', 'Active'),
  ('ACC002', 'CUST001', 'Private Bank A', 'Savings', '2023-01-15', 500000.00, 'USD', 'Active'),
  ('ACC003', 'CUST002', 'Private Bank B', 'Investment', '2023-02-20', 1800000.00, 'USD', 'Active'),
  ('ACC004', 'CUST003', 'Private Bank A', 'Investment', '2023-03-10', 6500000.00, 'USD', 'Active'),
  ('ACC005', 'CUST004', 'Private Bank C', 'Investment', '2023-04-05', 1200000.00, 'USD', 'Active'),
  ('ACC006', 'CUST005', 'Private Bank B', 'Savings', '2023-05-12', 800000.00, 'USD', 'Active'),
  ('ACC007', 'CUST006', 'Private Bank A', 'Investment', '2023-06-18', 8500000.00, 'USD', 'Active'),
  ('ACC008', 'CUST007', 'Private Bank D', 'Investment', '2023-07-22', 3200000.00, 'USD', 'Active'),
  ('ACC009', 'CUST008', 'Private Bank C', 'ESG Portfolio', '2023-08-01', 1600000.00, 'USD', 'Active');
"

# 4. Create holdings table
create_table_with_data "holdings" "
DROP TABLE IF EXISTS \`$PROJECT_ID.$DATASET_NAME.holdings\`;

CREATE TABLE \`$PROJECT_ID.$DATASET_NAME.holdings\` (
  holding_id STRING,
  client_id STRING,
  account_id STRING,
  asset_class STRING,
  asset_name STRING,
  symbol STRING,
  quantity NUMERIC,
  value NUMERIC,
  allocation_percentage NUMERIC,
  acquisition_date DATE,
  current_price NUMERIC
);

INSERT INTO \`$PROJECT_ID.$DATASET_NAME.holdings\` 
(holding_id, client_id, account_id, asset_class, asset_name, symbol, quantity, value, allocation_percentage, acquisition_date, current_price) VALUES
  ('H001', 'CUST001', 'ACC001', 'Equity', 'Apple Inc.', 'AAPL', 2000, 500000.00, 20.0, '2023-01-20', 250.00),
  ('H002', 'CUST001', 'ACC001', 'Bond', 'US Treasury 10Y', 'UST10Y', 3000, 300000.00, 12.0, '2023-01-25', 100.00),
  ('H003', 'CUST002', 'ACC003', 'Equity', 'Microsoft Corp', 'MSFT', 1500, 400000.00, 22.2, '2023-02-25', 266.67),
  ('H004', 'CUST002', 'ACC003', 'Real Estate', 'REIT Fund', 'VNQ', 2500, 200000.00, 11.1, '2023-03-01', 80.00),
  ('H005', 'CUST003', 'ACC004', 'Equity', 'Amazon.com Inc', 'AMZN', 5000, 750000.00, 11.5, '2023-03-15', 150.00),
  ('H006', 'CUST003', 'ACC004', 'Bond', 'Corporate Bond Fund', 'LQD', 1500, 150000.00, 2.3, '2023-03-20', 100.00),
  ('H007', 'CUST004', 'ACC005', 'Equity', 'S&P 500 ETF', 'SPY', 800, 300000.00, 25.0, '2023-04-10', 375.00),
  ('H008', 'CUST005', 'ACC006', 'Bond', 'Municipal Bonds', 'MUB', 4500, 450000.00, 56.25, '2023-05-15', 100.00),
  ('H009', 'CUST006', 'ACC007', 'Alternative', 'Private Equity Fund', 'PE-001', 100, 2000000.00, 23.5, '2023-06-20', 20000.00),
  ('H010', 'CUST007', 'ACC008', 'Equity', 'Tesla Inc', 'TSLA', 1000, 200000.00, 6.25, '2023-07-25', 200.00),
  ('H011', 'CUST008', 'ACC009', 'ESG', 'ESG Global Fund', 'ESGV', 2000, 400000.00, 25.0, '2023-08-05', 200.00);
"

# 5. Create transactions table
create_table_with_data "transactions" "
DROP TABLE IF EXISTS \`$PROJECT_ID.$DATASET_NAME.transactions\`;

CREATE TABLE \`$PROJECT_ID.$DATASET_NAME.transactions\` (
  transaction_id STRING,
  account_id STRING,
  client_id STRING,
  date DATE,
  amount NUMERIC,
  category STRING,
  description STRING,
  transaction_type STRING,
  asset_symbol STRING,
  quantity NUMERIC
);

INSERT INTO \`$PROJECT_ID.$DATASET_NAME.transactions\` 
(transaction_id, account_id, client_id, date, amount, category, description, transaction_type, asset_symbol, quantity) VALUES
  ('T001', 'ACC001', 'CUST001', '2025-08-01', 10000.00, 'Buy', 'Purchase Apple shares', 'Equity Purchase', 'AAPL', 40),
  ('T002', 'ACC003', 'CUST002', '2025-08-02', -5000.00, 'Sell', 'Sell REIT holdings', 'Equity Sale', 'VNQ', 62),
  ('T003', 'ACC004', 'CUST003', '2025-08-03', 15000.00, 'Buy', 'Add to Amazon position', 'Equity Purchase', 'AMZN', 100),
  ('T004', 'ACC001', 'CUST001', '2025-08-04', -8000.00, 'Sell', 'Trim bond position', 'Bond Sale', 'UST10Y', 80),
  ('T005', 'ACC005', 'CUST004', '2025-08-05', 25000.00, 'Buy', 'Increase SPY allocation', 'ETF Purchase', 'SPY', 67),
  ('T006', 'ACC006', 'CUST005', '2025-08-06', 3000.00, 'Deposit', 'Monthly contribution', 'Cash Deposit', NULL, NULL),
  ('T007', 'ACC007', 'CUST006', '2025-08-07', 50000.00, 'Buy', 'Private equity commitment', 'Alternative Investment', 'PE-001', 2.5),
  ('T008', 'ACC008', 'CUST007', '2025-08-07', -12000.00, 'Sell', 'Reduce Tesla exposure', 'Equity Sale', 'TSLA', 60),
  ('T009', 'ACC009', 'CUST008', '2025-08-07', 20000.00, 'Buy', 'ESG fund investment', 'ESG Purchase', 'ESGV', 100);
"

# 6. Create todo_tasks table
create_table_with_data "todo_tasks" "
DROP TABLE IF EXISTS \`$PROJECT_ID.$DATASET_NAME.todo_tasks\`;

CREATE TABLE \`$PROJECT_ID.$DATASET_NAME.todo_tasks\` (
  task_id STRING,
  task STRING,
  priority INT64,
  advisor_id STRING,
  client_id STRING,
  category STRING,
  due_date DATE,
  status STRING,
  created_date DATE,
  estimated_duration_minutes INT64
);

INSERT INTO \`$PROJECT_ID.$DATASET_NAME.todo_tasks\` 
(task_id, task, priority, advisor_id, client_id, category, due_date, status, created_date, estimated_duration_minutes) VALUES
  ('TASK001', 'Review Alice Smith portfolio performance and rebalancing needs', 1, 'ADV001', 'CUST001', 'Portfolio Review', '2025-08-08', 'Pending', '2025-08-07', 45),
  ('TASK002', 'Call Bob Jones about quarterly review meeting scheduling', 2, 'ADV002', 'CUST002', 'Client Meeting', '2025-08-09', 'Pending', '2025-08-07', 20),
  ('TASK003', 'Prepare investment committee presentation for Carol White', 1, 'ADV001', 'CUST003', 'Reporting', '2025-08-10', 'In Progress', '2025-08-06', 120),
  ('TASK004', 'Analyze market volatility impact on David Wilson conservative portfolio', 3, 'ADV003', 'CUST004', 'Risk Analysis', '2025-08-12', 'Pending', '2025-08-07', 60),
  ('TASK005', 'Send ESG investment opportunities summary to Emma Davis', 2, 'ADV002', 'CUST005', 'Research', '2025-08-09', 'Pending', '2025-08-07', 30),
  ('TASK006', 'Schedule annual wealth planning review for Frank Miller', 1, 'ADV003', 'CUST006', 'Wealth Planning', '2025-08-11', 'Pending', '2025-08-07', 180),
  ('TASK007', 'Review Grace Taylor risk tolerance after recent market events', 2, 'ADV004', 'CUST007', 'Risk Assessment', '2025-08-13', 'Pending', '2025-08-07', 40),
  ('TASK008', 'Prepare tax-loss harvesting recommendations for Henry Brown', 3, 'ADV005', 'CUST008', 'Tax Strategy', '2025-08-15', 'Pending', '2025-08-07', 90),
  ('TASK009', 'Update compliance documentation for new ESG regulations', 2, 'ADV005', NULL, 'Compliance', '2025-08-14', 'Pending', '2025-08-06', 75),
  ('TASK010', 'Research alternative investment opportunities for high-net-worth clients', 3, 'ADV003', NULL, 'Research', '2025-08-16', 'Pending', '2025-08-07', 150);
"

# 7. Create market_data table (for NBA suggestions)
create_table_with_data "market_data" "
DROP TABLE IF EXISTS \`$PROJECT_ID.$DATASET_NAME.market_data\`;

CREATE TABLE \`$PROJECT_ID.$DATASET_NAME.market_data\` (
  symbol STRING,
  date DATE,
  price NUMERIC,
  volume INT64,
  market_cap NUMERIC,
  pe_ratio NUMERIC,
  sector STRING,
  recommendation STRING,
  analyst_rating NUMERIC
);

INSERT INTO \`$PROJECT_ID.$DATASET_NAME.market_data\` 
(symbol, date, price, volume, market_cap, pe_ratio, sector, recommendation, analyst_rating) VALUES
  ('AAPL', '2025-08-07', 250.00, 45000000, 3800000000000, 28.5, 'Technology', 'Buy', 4.2),
  ('MSFT', '2025-08-07', 266.67, 32000000, 2800000000000, 32.1, 'Technology', 'Buy', 4.5),
  ('AMZN', '2025-08-07', 150.00, 28000000, 1600000000000, 45.2, 'Consumer Discretionary', 'Hold', 3.8),
  ('TSLA', '2025-08-07', 200.00, 55000000, 640000000000, 65.3, 'Consumer Discretionary', 'Hold', 3.5),
  ('SPY', '2025-08-07', 375.00, 75000000, 450000000000, 22.4, 'ETF', 'Buy', 4.0),
  ('VNQ', '2025-08-07', 80.00, 12000000, 35000000000, 18.7, 'Real Estate', 'Buy', 3.9),
  ('LQD', '2025-08-07', 100.00, 8000000, 25000000000, NULL, 'Fixed Income', 'Hold', 3.7),
  ('ESGV', '2025-08-07', 200.00, 15000000, 18000000000, 24.8, 'ESG', 'Buy', 4.1);
"

# 8. Create client_interactions table (for relationship tracking)
create_table_with_data "client_interactions" "
DROP TABLE IF EXISTS \`$PROJECT_ID.$DATASET_NAME.client_interactions\`;

CREATE TABLE \`$PROJECT_ID.$DATASET_NAME.client_interactions\` (
  interaction_id STRING,
  client_id STRING,
  advisor_id STRING,
  interaction_type STRING,
  date DATETIME,
  duration_minutes INT64,
  notes STRING,
  outcome STRING,
  next_action STRING
);

INSERT INTO \`$PROJECT_ID.$DATASET_NAME.client_interactions\` 
(interaction_id, client_id, advisor_id, interaction_type, date, duration_minutes, notes, outcome, next_action) VALUES
  ('INT001', 'CUST001', 'ADV001', 'Phone Call', '2025-08-05 14:30:00', 25, 'Discussed Q2 portfolio performance and rebalancing options', 'Positive', 'Send rebalancing proposal'),
  ('INT002', 'CUST002', 'ADV002', 'Video Meeting', '2025-08-04 10:00:00', 45, 'Quarterly review meeting, discussed risk tolerance', 'Neutral', 'Schedule follow-up in 2 weeks'),
  ('INT003', 'CUST003', 'ADV001', 'In-Person Meeting', '2025-08-03 15:00:00', 90, 'Annual wealth planning review, tax strategies discussed', 'Very Positive', 'Prepare tax optimization plan'),
  ('INT004', 'CUST006', 'ADV003', 'Phone Call', '2025-08-02 11:30:00', 20, 'Brief check-in on private equity allocation', 'Positive', 'Research additional PE opportunities'),
  ('INT005', 'CUST008', 'ADV005', 'Email', '2025-08-01 09:00:00', 5, 'Sent ESG fund performance update', 'Positive', 'Schedule quarterly review');
"

echo "🎉 Database setup completed successfully!"
echo ""
echo "📊 Tables created with sample data:"
echo "   • advisors: 5 sample private banking advisors"
echo "   • clients: 8 sample high-net-worth clients" 
echo "   • accounts: 9 investment and savings accounts"
echo "   • holdings: 11 diverse asset holdings (stocks, bonds, alternatives, ESG)"
echo "   • transactions: 9 recent trading transactions"
echo "   • todo_tasks: 10 advisor tasks with priorities and deadlines"
echo "   • market_data: Current market data for portfolio assets"
echo "   • client_interactions: 5 recent client interaction records"
echo ""
echo "🔍 Verify the data setup:"
echo "   bq query --use_legacy_sql=false \"SELECT COUNT(*) as total_clients FROM \`$PROJECT_ID.$DATASET_NAME.clients\`\""
echo "   bq query --use_legacy_sql=false \"SELECT * FROM \`$PROJECT_ID.$DATASET_NAME.todo_tasks\` LIMIT 3\""
echo ""
echo "🚀 Ready to test the Private Banking Advisor Copilot!"
echo "   Deploy the application and all 8 features will have rich sample data to work with."
