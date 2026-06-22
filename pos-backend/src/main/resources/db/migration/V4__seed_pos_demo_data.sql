-- V4: Seed POS demo data (tables, customers, suppliers, sample shift)

SET search_path = pos_mgmt;

INSERT INTO suppliers (code, name, phone, email, is_active) VALUES
    ('SUP-001', 'Fresh Foods Co.', '+1-555-0201', 'orders@freshfoods.com', TRUE),
    ('SUP-002', 'Beverage Distributors', '+1-555-0202', 'sales@bevdist.com', TRUE),
    ('SUP-003', 'Dairy Farm Ltd.', '+1-555-0203', 'info@dairyfarm.com', TRUE)
ON CONFLICT (code) DO NOTHING;

INSERT INTO customers (code, name, phone, email, is_active) VALUES
    ('WALK-IN', 'Walk-in Customer', NULL, NULL, TRUE),
    ('CUS-001', 'John Smith', '+1-555-0301', 'john@email.com', TRUE),
    ('CUS-002', 'Sarah Johnson', '+1-555-0302', 'sarah@email.com', TRUE),
    ('CUS-003', 'Mike Wilson', '+1-555-0303', 'mike@email.com', TRUE)
ON CONFLICT (code) DO NOTHING;

INSERT INTO restaurant_tables (branch_id, table_number, capacity, status)
SELECT b.id, t.num, t.cap, 'AVAILABLE'
FROM branches b,
     (VALUES ('T1', 2), ('T2', 4), ('T3', 4), ('T4', 6), ('T5', 8), ('T6', 2)) AS t(num, cap)
WHERE b.code = 'MAIN'
ON CONFLICT (branch_id, table_number) DO NOTHING;

-- Demo closed shift with sample sales (historical)
INSERT INTO shifts (branch_id, cashier_id, status, opened_at, closed_at, opening_cash, expected_cash, actual_cash, cash_difference, total_sales, notes)
SELECT
    b.id,
    u.id,
    'CLOSED',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day' + INTERVAL '8 hours',
    200.00,
    450.00,
    448.50,
    -1.50,
    250.00,
    'Demo closed shift'
FROM branches b, users u
WHERE b.code = 'MAIN' AND u.username = 'cashier'
ON CONFLICT DO NOTHING;

-- Sample paid order from yesterday
INSERT INTO pos_orders (order_number, branch_id, cashier_id, customer_id, order_type, status, kitchen_status, subtotal, discount_amount, tax_amount, total_amount, paid_amount, paid_at, created_at)
SELECT
    'ORD-DEMO-001',
    b.id,
    u.id,
    c.id,
    'DINE_IN',
    'PAID',
    'SERVED',
    22.48,
    0.00,
    2.25,
    24.73,
    24.73,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
FROM branches b, users u, customers c
WHERE b.code = 'MAIN' AND u.username = 'cashier' AND c.code = 'CUS-001'
ON CONFLICT (order_number) DO NOTHING;

INSERT INTO pos_order_items (order_id, product_id, product_name, quantity, unit_price, discount_amount, tax_amount, line_total, kitchen_status)
SELECT o.id, p.id, p.name, 2, p.selling_price, 0, p.selling_price * 2 * p.tax_rate / 100, p.selling_price * 2 * (1 + p.tax_rate / 100), 'SERVED'
FROM pos_orders o, products p
WHERE o.order_number = 'ORD-DEMO-001' AND p.sku = 'BEV-002'
ON CONFLICT DO NOTHING;

INSERT INTO pos_order_items (order_id, product_id, product_name, quantity, unit_price, discount_amount, tax_amount, line_total, kitchen_status)
SELECT o.id, p.id, p.name, 1, p.selling_price, 0, p.selling_price * p.tax_rate / 100, p.selling_price * (1 + p.tax_rate / 100), 'SERVED'
FROM pos_orders o, products p
WHERE o.order_number = 'ORD-DEMO-001' AND p.sku = 'FOOD-001'
ON CONFLICT DO NOTHING;

INSERT INTO payments (order_id, payment_method, amount, cash_amount, paid_at, created_by)
SELECT o.id, 'CASH', o.total_amount, o.total_amount, o.paid_at, 'cashier'
FROM pos_orders o WHERE o.order_number = 'ORD-DEMO-001'
ON CONFLICT DO NOTHING;

-- Held order for demo
INSERT INTO pos_orders (order_number, branch_id, cashier_id, order_type, status, subtotal, tax_amount, total_amount, held_at, created_at)
SELECT
    'ORD-HELD-001',
    b.id,
    u.id,
    'TAKEAWAY',
    'HELD',
    9.99,
    1.00,
    10.99,
    NOW(),
    NOW()
FROM branches b, users u
WHERE b.code = 'MAIN' AND u.username = 'cashier'
ON CONFLICT (order_number) DO NOTHING;

INSERT INTO pos_order_items (order_id, product_id, product_name, quantity, unit_price, tax_amount, line_total)
SELECT o.id, p.id, p.name, 1, p.selling_price, p.selling_price * p.tax_rate / 100, p.selling_price * (1 + p.tax_rate / 100)
FROM pos_orders o, products p
WHERE o.order_number = 'ORD-HELD-001' AND p.sku = 'FOOD-001'
ON CONFLICT DO NOTHING;
