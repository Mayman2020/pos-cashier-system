-- Strengthen default dev passwords to Dev@Local2026!
SET search_path = pos_mgmt;

UPDATE users
SET password_hash = '$2a$10$pWqrZrgfkYmeb1Ek41vH0.3wLCqLnYUMeap/47gr5UoTe7kEeaj3m'
WHERE username IN ('admin', 'cashier', 'manager');
