-- V2: Seed roles and users (admin / cashier)

SET search_path = pos_mgmt;

INSERT INTO roles (name, description) VALUES
    ('ADMIN', 'System administrator with full access'),
    ('MANAGER', 'Branch manager'),
    ('CASHIER', 'POS cashier')
ON CONFLICT (name) DO NOTHING;

INSERT INTO branches (code, name, address, phone, is_active) VALUES
    ('MAIN', 'Main Branch', '123 Main Street', '+1-555-0100', TRUE)
ON CONFLICT (code) DO NOTHING;

-- Password: admin123 (BCrypt $2a$10$)
INSERT INTO users (username, email, password_hash, full_name, branch_id, is_active, must_change_password)
VALUES (
    'admin',
    'admin@pos.local',
    '$2a$10$gYsuGgXpdufHfGkVChjuz.riQs85vwVAT2jF4GAzu7noXz1K/He0y',
    'System Administrator',
    (SELECT id FROM branches WHERE code = 'MAIN'),
    TRUE,
    FALSE
)
ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    is_active = TRUE;

INSERT INTO users (username, email, password_hash, full_name, branch_id, is_active, must_change_password)
VALUES (
    'cashier',
    'cashier@pos.local',
    '$2a$10$gYsuGgXpdufHfGkVChjuz.riQs85vwVAT2jF4GAzu7noXz1K/He0y',
    'Demo Cashier',
    (SELECT id FROM branches WHERE code = 'MAIN'),
    TRUE,
    FALSE
)
ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    is_active = TRUE;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'admin' AND r.name = 'ADMIN'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'cashier' AND r.name = 'CASHIER'
ON CONFLICT DO NOTHING;

INSERT INTO settings (setting_key, setting_value, description) VALUES
    ('business_name', 'POS Cashier Demo', 'Business display name'),
    ('currency', 'USD', 'Default currency'),
    ('tax_inclusive', 'false', 'Prices include tax'),
    ('low_stock_alert', 'true', 'Enable low stock alerts'),
    ('restaurant_mode', 'true', 'Enable restaurant/café features'),
    ('supermarket_mode', 'true', 'Enable supermarket features')
ON CONFLICT (setting_key) DO NOTHING;
