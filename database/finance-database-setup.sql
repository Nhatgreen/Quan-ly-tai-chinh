-- ============================================
-- DATABASE: Quản lý tài chính cá nhân
-- Tech Stack: MySQL 8.0+
-- Created: 2026-05-13
-- ============================================

-- Tạo database
CREATE DATABASE IF NOT EXISTS finance_management
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE finance_management;

-- ============================================
-- TABLE: users
-- Mô tả: Lưu thông tin người dùng
-- ============================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL COMMENT 'BCrypt hashed password',
    full_name VARCHAR(100),
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: categories
-- Mô tả: Danh mục thu chi (Ăn uống, Di chuyển, Lương...)
-- ============================================
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    icon VARCHAR(50) COMMENT 'Icon name hoặc emoji',
    color VARCHAR(7) COMMENT 'Hex color code, ví dụ: #FF5733',
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE COMMENT 'Category mặc định của hệ thống',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_category (name, type),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: transactions
-- Mô tả: Giao dịch thu chi
-- ============================================
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL COMMENT 'Số tiền (luôn dương)',
    type ENUM('income', 'expense') NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL COMMENT 'Ngày giao dịch thực tế',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_user_date (user_id, transaction_date),
    INDEX idx_user_type (user_id, type),
    INDEX idx_user_category (user_id, category_id),
    INDEX idx_date (transaction_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: monthly_reports
-- Mô tả: Báo cáo tổng hợp theo tháng (tự động tính)
-- ============================================
CREATE TABLE monthly_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    month INT NOT NULL COMMENT '1-12',
    year INT NOT NULL COMMENT 'YYYY',
    total_income DECIMAL(15, 2) DEFAULT 0,
    total_expense DECIMAL(15, 2) DEFAULT 0,
    balance DECIMAL(15, 2) DEFAULT 0 COMMENT 'total_income - total_expense',
    transaction_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_month_report (user_id, year, month),
    INDEX idx_user_year (user_id, year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: budgets
-- Mô tả: Ngân sách theo category (user tự đặt)
-- ============================================
CREATE TABLE budgets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL COMMENT 'Ngân sách tối đa',
    month INT NOT NULL COMMENT '1-12',
    year INT NOT NULL COMMENT 'YYYY',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_budget (user_id, category_id, year, month),
    INDEX idx_user_period (user_id, year, month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: ml_predictions
-- Mô tả: Lưu kết quả dự đoán ML
-- ============================================
CREATE TABLE ml_predictions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    prediction_type ENUM('monthly_expense', 'category_spending', 'auto_categorize') NOT NULL,
    target_month INT COMMENT 'Tháng dự đoán (1-12)',
    target_year INT COMMENT 'Năm dự đoán (YYYY)',
    predicted_value DECIMAL(15, 2) COMMENT 'Giá trị dự đoán',
    confidence_score DECIMAL(5, 4) COMMENT 'Độ tin cậy (0-1)',
    model_version VARCHAR(20) COMMENT 'Phiên bản model',
    metadata JSON COMMENT 'Thông tin thêm (features, params...)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_type (user_id, prediction_type),
    INDEX idx_user_period (user_id, target_year, target_month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: user_settings
-- Mô tả: Cài đặt cá nhân của user
-- ============================================
CREATE TABLE user_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    currency VARCHAR(3) DEFAULT 'VND' COMMENT 'Mã tiền tệ ISO 4217',
    language VARCHAR(5) DEFAULT 'vi' COMMENT 'Ngôn ngữ (vi, en...)',
    timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    notification_enabled BOOLEAN DEFAULT TRUE,
    theme VARCHAR(10) DEFAULT 'light' COMMENT 'light, dark, auto',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERT DEFAULT CATEGORIES
-- ============================================

-- Income categories
INSERT INTO categories (name, type, icon, color, is_default) VALUES
('Lương', 'income', '💰', '#4CAF50', TRUE),
('Thưởng', 'income', '🎁', '#8BC34A', TRUE),
('Đầu tư', 'income', '📈', '#009688', TRUE),
('Khác', 'income', '💵', '#607D8B', TRUE);

-- Expense categories
INSERT INTO categories (name, type, icon, color, is_default) VALUES
('Ăn uống', 'expense', '🍔', '#FF5722', TRUE),
('Di chuyển', 'expense', '🚗', '#FF9800', TRUE),
('Mua sắm', 'expense', '🛒', '#E91E63', TRUE),
('Giải trí', 'expense', '🎮', '#9C27B0', TRUE),
('Nhà ở', 'expense', '🏠', '#3F51B5', TRUE),
('Y tế', 'expense', '💊', '#F44336', TRUE),
('Giáo dục', 'expense', '📚', '#2196F3', TRUE),
('Tiết kiệm', 'expense', '🏦', '#00BCD4', TRUE),
('Khác', 'expense', '💸', '#9E9E9E', TRUE);

-- ============================================
-- STORED PROCEDURES
-- ============================================

-- Procedure: Cập nhật monthly_reports sau khi thêm/sửa/xóa transaction
DELIMITER //

CREATE PROCEDURE update_monthly_report(
    IN p_user_id INT,
    IN p_year INT,
    IN p_month INT
)
BEGIN
    -- Tính tổng thu
    DECLARE v_total_income DECIMAL(15, 2);
    -- Tính tổng chi
    DECLARE v_total_expense DECIMAL(15, 2);
    -- Đếm số giao dịch
    DECLARE v_count INT;
    
    SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0),
        COUNT(*)
    INTO v_total_income, v_total_expense, v_count
    FROM transactions
    WHERE user_id = p_user_id
        AND YEAR(transaction_date) = p_year
        AND MONTH(transaction_date) = p_month;
    
    -- Insert hoặc update
    INSERT INTO monthly_reports (user_id, month, year, total_income, total_expense, balance, transaction_count)
    VALUES (p_user_id, p_month, p_year, v_total_income, v_total_expense, v_total_income - v_total_expense, v_count)
    ON DUPLICATE KEY UPDATE
        total_income = v_total_income,
        total_expense = v_total_expense,
        balance = v_total_income - v_total_expense,
        transaction_count = v_count,
        updated_at = CURRENT_TIMESTAMP;
END //

DELIMITER ;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Tự động cập nhật monthly_reports sau khi INSERT transaction
DELIMITER //

CREATE TRIGGER after_transaction_insert
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
    CALL update_monthly_report(
        NEW.user_id,
        YEAR(NEW.transaction_date),
        MONTH(NEW.transaction_date)
    );
END //

-- Trigger: Tự động cập nhật monthly_reports sau khi UPDATE transaction
CREATE TRIGGER after_transaction_update
AFTER UPDATE ON transactions
FOR EACH ROW
BEGIN
    -- Cập nhật tháng cũ (nếu đổi ngày)
    IF OLD.transaction_date != NEW.transaction_date THEN
        CALL update_monthly_report(
            OLD.user_id,
            YEAR(OLD.transaction_date),
            MONTH(OLD.transaction_date)
        );
    END IF;
    
    -- Cập nhật tháng mới
    CALL update_monthly_report(
        NEW.user_id,
        YEAR(NEW.transaction_date),
        MONTH(NEW.transaction_date)
    );
END //

-- Trigger: Tự động cập nhật monthly_reports sau khi DELETE transaction
CREATE TRIGGER after_transaction_delete
AFTER DELETE ON transactions
FOR EACH ROW
BEGIN
    CALL update_monthly_report(
        OLD.user_id,
        YEAR(OLD.transaction_date),
        MONTH(OLD.transaction_date)
    );
END //

DELIMITER ;

-- ============================================
-- VIEWS
-- ============================================

-- View: Tổng quan tài chính của user
CREATE VIEW v_user_financial_summary AS
SELECT 
    u.id AS user_id,
    u.username,
    u.email,
    COUNT(DISTINCT t.id) AS total_transactions,
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) AS total_income,
    COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS total_expense,
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS balance,
    MAX(t.transaction_date) AS last_transaction_date
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id
GROUP BY u.id, u.username, u.email;

-- View: Chi tiêu theo category (tháng hiện tại)
CREATE VIEW v_current_month_spending_by_category AS
SELECT 
    t.user_id,
    c.name AS category_name,
    c.icon,
    c.color,
    COUNT(t.id) AS transaction_count,
    SUM(t.amount) AS total_amount,
    ROUND(SUM(t.amount) * 100.0 / SUM(SUM(t.amount)) OVER (PARTITION BY t.user_id), 2) AS percentage
FROM transactions t
JOIN categories c ON t.category_id = c.id
WHERE t.type = 'expense'
    AND YEAR(t.transaction_date) = YEAR(CURDATE())
    AND MONTH(t.transaction_date) = MONTH(CURDATE())
GROUP BY t.user_id, c.id, c.name, c.icon, c.color;

-- ============================================
-- SAMPLE DATA (for testing)
-- ============================================

-- Tạo user mẫu (password: "password123" đã hash bằng BCrypt)
INSERT INTO users (username, email, password, full_name) VALUES
('demo_user', 'demo@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEg6K6', 'Demo User');

-- Lấy user_id vừa tạo
SET @demo_user_id = LAST_INSERT_ID();

-- Tạo settings cho user
INSERT INTO user_settings (user_id) VALUES (@demo_user_id);

-- Tạo transactions mẫu (tháng hiện tại)
INSERT INTO transactions (user_id, category_id, amount, type, description, transaction_date) VALUES
(@demo_user_id, 1, 15000000, 'income', 'Lương tháng 5', '2026-05-01'),
(@demo_user_id, 5, 500000, 'expense', 'Ăn sáng quán phở', '2026-05-02'),
(@demo_user_id, 6, 200000, 'expense', 'Grab đi làm', '2026-05-02'),
(@demo_user_id, 7, 1200000, 'expense', 'Mua áo sơ mi', '2026-05-03'),
(@demo_user_id, 8, 300000, 'expense', 'Xem phim', '2026-05-04'),
(@demo_user_id, 5, 450000, 'expense', 'Ăn trưa nhà hàng', '2026-05-05'),
(@demo_user_id, 9, 3000000, 'expense', 'Tiền nhà tháng 5', '2026-05-05'),
(@demo_user_id, 10, 150000, 'expense', 'Mua thuốc cảm', '2026-05-06');

-- Tạo budgets mẫu
INSERT INTO budgets (user_id, category_id, amount, month, year) VALUES
(@demo_user_id, 5, 3000000, 5, 2026),  -- Ăn uống: 3tr/tháng
(@demo_user_id, 6, 1000000, 5, 2026),  -- Di chuyển: 1tr/tháng
(@demo_user_id, 7, 2000000, 5, 2026);  -- Mua sắm: 2tr/tháng

-- ============================================
-- USEFUL QUERIES
-- ============================================

-- Query 1: Xem tổng quan tài chính của user
-- SELECT * FROM v_user_financial_summary WHERE user_id = @demo_user_id;

-- Query 2: Xem chi tiêu theo category tháng hiện tại
-- SELECT * FROM v_current_month_spending_by_category WHERE user_id = @demo_user_id ORDER BY total_amount DESC;

-- Query 3: Xem lịch sử giao dịch 30 ngày gần nhất
-- SELECT t.*, c.name AS category_name, c.icon
-- FROM transactions t
-- JOIN categories c ON t.category_id = c.id
-- WHERE t.user_id = @demo_user_id
--     AND t.transaction_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
-- ORDER BY t.transaction_date DESC, t.created_at DESC;

-- Query 4: So sánh chi tiêu với budget
-- SELECT 
--     b.category_id,
--     c.name AS category_name,
--     b.amount AS budget_amount,
--     COALESCE(SUM(t.amount), 0) AS spent_amount,
--     b.amount - COALESCE(SUM(t.amount), 0) AS remaining,
--     ROUND(COALESCE(SUM(t.amount), 0) * 100.0 / b.amount, 2) AS usage_percentage
-- FROM budgets b
-- JOIN categories c ON b.category_id = c.id
-- LEFT JOIN transactions t ON b.user_id = t.user_id 
--     AND b.category_id = t.category_id
--     AND YEAR(t.transaction_date) = b.year
--     AND MONTH(t.transaction_date) = b.month
--     AND t.type = 'expense'
-- WHERE b.user_id = @demo_user_id
--     AND b.year = YEAR(CURDATE())
--     AND b.month = MONTH(CURDATE())
-- GROUP BY b.category_id, c.name, b.amount;

-- Query 5: Xu hướng chi tiêu 6 tháng gần nhất
-- SELECT 
--     year,
--     month,
--     total_income,
--     total_expense,
--     balance
-- FROM monthly_reports
-- WHERE user_id = @demo_user_id
-- ORDER BY year DESC, month DESC
-- LIMIT 6;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Đã tạo indexes trong CREATE TABLE statements
-- Thêm composite indexes nếu cần:

-- Index cho query filter theo date range
CREATE INDEX idx_transactions_user_date_range ON transactions(user_id, transaction_date, type);

-- Index cho ML predictions lookup
CREATE INDEX idx_ml_predictions_lookup ON ml_predictions(user_id, prediction_type, target_year, target_month);

-- ============================================
-- DATABASE MAINTENANCE
-- ============================================

-- Backup command (chạy từ terminal):
-- mysqldump -u root -p finance_management > finance_management_backup_$(date +%Y%m%d).sql

-- Restore command:
-- mysql -u root -p finance_management < finance_management_backup_YYYYMMDD.sql

-- ============================================
-- NOTES
-- ============================================

-- 1. Password trong bảng users phải được hash bằng BCrypt trước khi lưu
-- 2. Triggers tự động cập nhật monthly_reports khi có thay đổi transactions
-- 3. Views giúp query nhanh các thống kê thường dùng
-- 4. Stored procedure update_monthly_report có thể gọi thủ công nếu cần
-- 5. Sample data có password: "password123" (đã hash)
-- 6. Nhớ tạo user MySQL riêng cho app, không dùng root:
--    CREATE USER 'finance_app'@'localhost' IDENTIFIED BY 'secure_password';
--    GRANT ALL PRIVILEGES ON finance_management.* TO 'finance_app'@'localhost';
--    FLUSH PRIVILEGES;

-- ============================================
-- END OF SCRIPT
-- ============================================
