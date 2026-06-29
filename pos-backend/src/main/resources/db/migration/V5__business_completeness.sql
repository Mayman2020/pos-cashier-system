-- V5: Business completeness — shift cash tracking, taxes, loyalty, refunds, stock-in supplier

SET search_path = pos_mgmt;

-- Shift payment breakdown
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS total_cash_sales NUMERIC(14,2) NOT NULL DEFAULT 0;
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS total_card_sales NUMERIC(14,2) NOT NULL DEFAULT 0;
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS total_refunds_cash NUMERIC(14,2) NOT NULL DEFAULT 0;
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS total_refunds_card NUMERIC(14,2) NOT NULL DEFAULT 0;
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS total_payouts NUMERIC(14,2) NOT NULL DEFAULT 0;

-- Product tax catalog link
ALTER TABLE products ADD COLUMN IF NOT EXISTS tax_id BIGINT REFERENCES taxes(id);

-- Order discount & loyalty
ALTER TABLE pos_orders ADD COLUMN IF NOT EXISTS discount_id BIGINT REFERENCES discounts(id);
ALTER TABLE pos_orders ADD COLUMN IF NOT EXISTS discount_code VARCHAR(30);
ALTER TABLE pos_orders ADD COLUMN IF NOT EXISTS loyalty_points_redeemed INT NOT NULL DEFAULT 0;
ALTER TABLE pos_orders ADD COLUMN IF NOT EXISTS loyalty_points_earned INT NOT NULL DEFAULT 0;
ALTER TABLE pos_orders ADD COLUMN IF NOT EXISTS refund_reason VARCHAR(500);
ALTER TABLE pos_orders ADD COLUMN IF NOT EXISTS refunded_amount NUMERIC(14,2);

-- Stock-in supplier linkage
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS supplier_id BIGINT REFERENCES suppliers(id);
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS invoice_no VARCHAR(100);
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS invoice_date DATE;

-- Payment refunds
ALTER TABLE payments ADD COLUMN IF NOT EXISTS is_refund BOOLEAN NOT NULL DEFAULT FALSE;

-- Loyalty transactions
CREATE TABLE IF NOT EXISTS loyalty_transactions (
    id                  BIGSERIAL PRIMARY KEY,
    customer_id         BIGINT NOT NULL REFERENCES customers(id),
    order_id            BIGINT REFERENCES pos_orders(id),
    transaction_type    VARCHAR(20) NOT NULL CHECK (transaction_type IN ('EARN','REDEEM','ADJUST')),
    points              INT NOT NULL,
    notes               VARCHAR(500),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by          VARCHAR(100)
);

-- Allow partial refund status
ALTER TABLE pos_orders DROP CONSTRAINT IF EXISTS pos_orders_status_check;
ALTER TABLE pos_orders ADD CONSTRAINT pos_orders_status_check
    CHECK (status IN ('DRAFT','HELD','PENDING','PREPARING','READY','SERVED','PAID','CANCELLED','REFUNDED','PARTIALLY_REFUNDED'));

UPDATE products p
SET tax_id = (SELECT id FROM taxes WHERE is_default = TRUE LIMIT 1)
WHERE p.tax_id IS NULL AND EXISTS (SELECT 1 FROM taxes WHERE is_default = TRUE);

UPDATE products p
SET tax_rate = t.rate
FROM taxes t
WHERE p.tax_id = t.id AND p.tax_rate = 0;

-- Manager seed user (password: admin123)
INSERT INTO users (username, email, password_hash, full_name, branch_id, is_active, must_change_password)
VALUES (
    'manager',
    'manager@pos.local',
    '$2a$10$gYsuGgXpdufHfGkVChjuz.riQs85vwVAT2jF4GAzu7noXz1K/He0y',
    'Branch Manager',
    (SELECT id FROM branches WHERE code = 'MAIN'),
    TRUE,
    FALSE
)
ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    is_active = TRUE;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'manager' AND r.name = 'MANAGER'
ON CONFLICT DO NOTHING;

-- Additional settings
INSERT INTO settings (setting_key, setting_value, description) VALUES
    ('loyalty_points_per_currency', '10', 'Currency units per 1 loyalty point earned'),
    ('loyalty_redeem_value', '0.5', 'Currency value per redeemed point'),
    ('cash_variance_threshold', '50', 'Max cash variance before warning on shift close'),
    ('allow_manual_discount', 'true', 'Allow manual discount without catalog code'),
    ('upload_base_url', '/api/v1/files', 'Base URL for uploaded files')
ON CONFLICT (setting_key) DO NOTHING;
