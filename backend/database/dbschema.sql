CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    phone_number VARCHAR(15) NOT NULL UNIQUE,
    country_code VARCHAR(5) DEFAULT '+91',
    otp_verified BOOLEAN DEFAULT FALSE,
    is_registered BOOLEAN DEFAULT FALSE,  -- true only after completing profile
    current_role ENUM('helper', 'requester') DEFAULT 'requester',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
    profile_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    gender ENUM('male', 'female', 'other', 'prefer_not_to_say'),
    age INT CHECK (age >= 18),
    city VARCHAR(100),
    profile_photo_url VARCHAR(255),

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE otp (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mobile VARCHAR(15) NOT NULL,
    vid VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    requester_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location_details VARCHAR(255),
    type ENUM('regular', 'enquiry') NOT NULL, 
    category ENUM('delivery', 'cleaning', 'tech', 'moving', 'other'), 
    status ENUM('open', 'assigned', 'in_progress', 'completed', 'cancelled') DEFAULT 'open',
    budget DECIMAL(10, 2) NULL,        
    reward_xp INT NULL,               
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE task_assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    helper_id INT NOT NULL,
    assignment_status ENUM('pending_helper_confirm', 'active', 'completed', 'rated') DEFAULT 'active',
    final_payment_amount DECIMAL(10, 2) NULL,
    helper_rating DECIMAL(2, 1) NULL, 
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (helper_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_active_assignment (task_id, helper_id)
);

CREATE TABLE chat_messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    sender_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES task_assignments(assignment_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- CREATE TABLE super_admins (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     username VARCHAR(100) UNIQUE,
--     email VARCHAR(100),
-- 	phone varchar(10) unique
--     password VARCHAR(255),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP                     
-- );




-- CREATE TABLE user_admin_plans (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     plan_name VARCHAR(100),
--     price DECIMAL(10,2),
--     duration_in_days INT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     super_admin_id INT,
--     FOREIGN KEY (super_admin_id) REFERENCES super_admins(id) ON DELETE CASCADE  
-- );



-- CREATE TABLE purchase_history (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     user_id INT,
--     plan_id INT,
--     purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     amount DECIMAL(10, 2),
--     payment_status ENUM('Pending', 'Approved', 'Rejected'),
--     transaction_reference VARCHAR(100),
--     super_admin_id INT,
--     FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
--     FOREIGN KEY (plan_id) REFERENCES user_admin_plans(id) ON DELETE CASCADE,
--     FOREIGN KEY (super_admin_id) REFERENCES super_admins(id) ON DELETE CASCADE
-- );

 
-- CREATE TABLE admin_users (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     user_id VARCHAR(50) UNIQUE NOT NULL,
--     password_hash VARCHAR(255) NOT NULL,
--     username VARCHAR(100) NOT NULL,
--     mobile_number VARCHAR(15),
--     email VARCHAR(100),
--     organisation_name VARCHAR(255),
--     gst_tax_reference VARCHAR(50),
--     user_plan_id INT,
--     number_of_users INT DEFAULT 1,
--     is_blocked BOOLEAN DEFAULT FALSE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,   
--     image varchar(500);    
--     super_admin_id INT,
--     FOREIGN KEY (user_plan_id) REFERENCES user_admin_plans(id) ON DELETE CASCADE,
--     FOREIGN KEY (super_admin_id) REFERENCES super_admins(id) ON DELETE CASCADE
-- );


-- CREATE TABLE users (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(100),
--     mobile_number VARCHAR(15),
--     user_id VARCHAR(50) UNIQUE,
--     password_hash VARCHAR(255),
--     is_blocked BOOLEAN DEFAULT FALSE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     admin_user_id INT,
--     FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE
-- );

-- CREATE TABLE vendors (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     vendor_name VARCHAR(100),
--     vendor_code VARCHAR(50) UNIQUE,
--     vendor_type VARCHAR(100),
--      tax_details JSON,
--      account_details JSON,
--     address TEXT,
-- 	description text,
--     is_blocked BOOLEAN DEFAULT FALSE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     admin_user_id INT,
--     FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE
-- );

-- CREATE TABLE vendor_payments (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     payment_id VARCHAR(100),
--     payment_type VARCHAR(50),
--     vendor_id INT,
--     reason TEXT,
--     description TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     admin_user_id INT,
--     FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
--     FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE
-- );




-- CREATE TABLE products (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     product_name VARCHAR(100),
--     txn_code VARCHAR(50),
--     uom VARCHAR(20),
--     gst JSON default null,
--     buying_price DECIMAL(10, 2),
--     selling_price DECIMAL(10, 2),
--     brand VARCHAR(100),
--     is_blocked BOOLEAN DEFAULT FALSE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     admin_user_id INT,
--     FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE
-- );

-- CREATE TABLE stocks (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     ean_code VARCHAR(50),
--     product_id INT,
--     quantity INT,
--     batch_number VARCHAR(100),
--     expiry_date DATE,
--     received_date DATE,
--     vendor_id INT,
--     received_price DECIMAL(10, 2),
--     is_blocked BOOLEAN DEFAULT FALSE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     admin_user_id INT,
--     FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
--     FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
--     FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE
-- );

-- CREATE TABLE patients (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     patient_name VARCHAR(100),
--     mobile_number VARCHAR(15),
--     photo varchar(500)
--     patient_type VARCHAR(50),
--     address TEXT,
--     alt_mobile_number VARCHAR(15),
--     blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
--     illness_type TEXT,
--     date_of_admission DATE,
--     previous_medications TEXT,
--     previous_consultants TEXT,
--     previous_surgeries TEXT,
--     admitted_by_name VARCHAR(100),
--     admitted_by_contact VARCHAR(15),
--     admitted_by_address TEXT,
--     email VARCHAR(100),
--     age INT,
--     gender ENUM('Male', 'Female', 'Other'),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     admin_user_id INT,
--     FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE
-- );

-- CREATE TABLE doctors (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     doctor_name VARCHAR(100),
--     mobile_number VARCHAR(15),
--     email VARCHAR(100) unique,
-- 	password varchar(100),
--     alt_mobile_number VARCHAR(15),
--     doctor_type VARCHAR(100),
--     years_of_experience INT,
--     specialization VARCHAR(150),
--     opd_start_time TIME,
--     opd_end_time TIME,
--     availability_days SET('Mon','Tue','Wed','Thu','Fri','Sat','Sun'),
-- 	is_blocked boolean default false,
-- 	is_terminate BOOLEAN  default false,
-- 	is_resigned BOOLEAN  default false,
--     profile_photo varchar(500),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     admin_user_id INT,
--     FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE
-- );

-- CREATE TABLE wards (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     ward_name VARCHAR(100),
--     total_beds INT,
--     ward_type VARCHAR(100),
--     specialization VARCHAR(150),
--     is_ac BOOLEAN,
--     is_blocked BOOLEAN DEFAULT FALSE,
--     block_description TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     admin_user_id INT,
--     FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE
-- );

-- CREATE TABLE beds (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     ward_id INT,
--     bed_number VARCHAR(50),
--     bed_type VARCHAR(100),
--     description TEXT,
--     price_per_day DECIMAL(10,2),
--     has_oxygen BOOLEAN,
--     company_name VARCHAR(100),
--     is_blocked BOOLEAN DEFAULT FALSE,
--     block_description TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,   
--     admin_user_id INT,
--     FOREIGN KEY (ward_id) REFERENCES wards(id) ON DELETE CASCADE,
--     FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE
-- );

-- CREATE TABLE patient_allotments (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     patient_id INT,
--     doctor_id INT,
--     ward_id INT,
--     bed_id INT,
--     requires_oxygen BOOLEAN,
--     meal_subscription BOOLEAN,
--     meals_per_day INT DEFAULT 0,
--     is_blocked BOOLEAN DEFAULT FALSE,
--     status ENUM('pending', 'attended', 'discharged') DEFAULT 'pending';
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     admin_user_id INT,
--     FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
--     FOREIGN KEY (doctor_id) REFERENCES doctors(id),
--     FOREIGN KEY (ward_id) REFERENCES wards(id),
--     FOREIGN KEY (bed_id) REFERENCES beds(id),
--     FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE
-- );

-- CREATE TABLE labs (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     lab_name VARCHAR(100),
--     lab_incharge_name VARCHAR(100),
--     email VARCHAR(100) unique,
--     password VARCHAR(255),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     admin_user_id INT,
--     FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE
-- );
-- CREATE TABLE tests (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     test_code VARCHAR(50) UNIQUE,
--     test_description TEXT,
--     lab_id INT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     admin_user_id INT,
--     FOREIGN KEY (lab_id) REFERENCES labs(id) ON DELETE CASCADE,
--     FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE
-- );


-- CREATE TABLE pharmacy_masters (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     pharmacy_name VARCHAR(100),
--     location TEXT,
--     incharge_name VARCHAR(100),
--     email VARCHAR(100),
--     password VARCHAR(255), 
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     admin_user_id INT,
--     FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE
-- );

-- CREATE TABLE patient_vitals (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     patient_id INT,
--     doctor_id INT,
--     bp VARCHAR(20),
--     height_cm DECIMAL(5,2),
--     weight_kg DECIMAL(5,2),
--     heart_beat INT,
--     sugar_level VARCHAR(20),
--     description TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    
--     FOREIGN KEY (patient_id) REFERENCES patients(id),
--     FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
-- );

-- CREATE TABLE patient_vital_tests (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     patient_vital_id INT,
--     test_id INT,
--     doctor_id INT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     status ENUM('pending', 'attended') DEFAULT pending,
--     FOREIGN KEY (patient_vital_id) REFERENCES patient_vitals(id) ON DELETE CASCADE,
--     FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
--     FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
-- );


-- CREATE TABLE patient_analysis (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     patient_id INT,
--     doctor_id INT,
--     critical_illness TEXT,
--     cure TEXT,
--     medication TEXT,
--     admit BOOLEAN, 
--     allotted_ward_id INT, 
--     allotted_bed_id INT,  
--     surgery_required BOOLEAN, 
--     surgery_description TEXT, 
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (patient_id) REFERENCES patients(id),
--     FOREIGN KEY (allotted_ward_id) REFERENCES wards(id),
--     FOREIGN KEY (allotted_bed_id) REFERENCES beds(id),
--     FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
-- );


-- CREATE TABLE prescribed_medicines (
--     id INT AUTO_INCREMENT PRIMARY KEY,                   
--     patient_id INT,
--     doctor_id INT,
--     illness_type VARCHAR(100),
--     medicine_name VARCHAR(100),
--     quantity INT,
--     consumption_times JSON,                       
--     no_of_days INT,
--     pharmacy_id INT,

--     status ENUM('pending', 'attended') DEFAULT pending,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (patient_id) REFERENCES patients(id),
--     FOREIGN KEY (pharmacy_id) REFERENCES pharmacy_masters(id),
--     FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
-- );
