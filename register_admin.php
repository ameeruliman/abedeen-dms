<?php
session_start();
require_once 'db_connect.php';

if (!isset($_SESSION['admin']) || !$_SESSION['admin']) {
    header('Location: login.php');
    exit;
}
// Only superadmin can access this page
if (!isset($_SESSION['admin_department']) || strtolower($_SESSION['admin_department']) !== 'superadmin') {
    header('Location: admin_panel.php');
    exit;
}

$message = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    $department = $_POST['department'];
    $allowedDepartments = ['registration','visa','finance','uniform','canteen'];
    if (!in_array($department, $allowedDepartments, true)) {
        $message = "Invalid department selected.";
    } else {
        $stmt = $pdo->prepare("INSERT INTO admin (username, password, department) VALUES (?, ?, ?)");
        try {
            $stmt->execute([$username, $password, $department]);
            $message = "Admin registered successfully!";
        } catch (PDOException $e) {
            $message = "Error: " . $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Register Admin - HR Office</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Match fonts and styling with login.php -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #7c25af;
            --primary-light: #9c47d3;
            --primary-dark: #5c1b84;
            --accent: #f7b731;
            --bg: #f8f9fc;
            --white: #fff;
            --text: #2d3748;
            --text-light: #64748b;
            --shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
            --shadow-hover: 0 12px 40px rgba(0, 0, 0, 0.12);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'Inter', sans-serif;
            background: var(--bg);
            color: var(--text);
            line-height: 1.6;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        /* Header (same as login.php) */
        .top-header {
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            color: var(--white);
            padding: 20px 32px;
            box-shadow: var(--shadow);
        }
        .header-container {
            max-width: 1200px;
            margin: 0 auto;
            display: flex; justify-content: space-between; align-items: center;
        }
        .header-left { display: flex; align-items: center; gap: 20px; }
        .logo {
            height: 70px; width: auto; border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .office-info h2 {
            font-size: 1.6rem; font-weight: 700; margin-bottom: 4px; letter-spacing: -0.5px;
        }
        .office-info p { font-size: 0.95rem; opacity: 0.9; margin: 2px 0; }
        .header-right { display: flex; align-items: center; gap: 32px; }
        .contact-info { text-align: right; font-size: 0.95rem; }
        .contact-info p {
            margin: 4px 0; display: flex; align-items: center; gap: 8px; justify-content: flex-end;
        }
        .back-home-btn {
            padding: 12px 24px; background: var(--white); color: var(--primary);
            font-weight: 600; border-radius: 10px; text-decoration: none;
            transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .back-home-btn:hover {
            background: var(--accent); color: var(--white);
            transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }

        /* Content card (same sizing as login.php) */
        .content-wrapper {
            flex: 1; display: flex; align-items: center; justify-content: center; padding: 32px;
        }
        .card {
            width: 100%; max-width: 440px; background: var(--white);
            border-radius: 20px; padding: 40px; box-shadow: var(--shadow);
        }
        .logo-container { text-align: center; margin-bottom: 32px; }
        .logo-container .logo { height: 80px; }

        /* Typography & form controls */
        h1 {
            color: var(--primary); font-size: 1.8rem; font-weight: 700;
            margin-bottom: 24px; text-align: center;
        }
        .form-group { margin-bottom: 20px; }
        label { display: block; font-weight: 600; margin-bottom: 8px; color: var(--text); }
        input[type="text"], input[type="password"], select {
            width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0;
            border-radius: 10px; font-size: 1rem; transition: all 0.3s ease; background: var(--white);
        }
        input[type="text"]:focus, input[type="password"]:focus, select:focus {
            border-color: var(--primary); box-shadow: 0 0 0 4px rgba(124, 37, 175, 0.1); outline: none;
        }

        .success-message {
            color: #2f9e44; font-size: 0.95rem; margin-top: 8px; text-align: center;
            background: #f0fff0; border: 1px solid #b7e4c7; border-radius: 8px; padding: 10px;
        }

        .submit-btn {
            width: 100%; padding: 12px; background: var(--primary); color: var(--white);
            border: none; border-radius: 10px; font-weight: 600; font-size: 1rem;
            cursor: pointer; transition: all 0.3s ease;
        }
        .submit-btn:hover { background: var(--primary-light); transform: translateY(-2px); }

        @media (max-width: 768px) {
            .header-container { flex-direction: column; text-align: center; gap: 20px; }
            .header-left { flex-direction: column; gap: 16px; }
            .header-right { flex-direction: column; gap: 16px; }
            .contact-info { text-align: center; }
            .contact-info p { justify-content: center; }
        }
        @media (max-width: 480px) {
            .card { padding: 24px; }
            .content-wrapper { padding: 16px; }
        }
    </style>
</head>
<body>
    <header class="top-header">
        <div class="header-container">
            <div class="header-left">
                <img src="logo.png" alt="Office Logo" class="logo">
                <div class="office-info">
                    <h2>Abedeen HR Office</h2>
                    <p>Document Management System</p>
                    <p>For Staff and Parents</p>
                </div>
            </div>
            <div class="header-right">
                <div class="contact-info">
                    <p><strong>📞</strong> 03 - 8687 6999</p>
                    <p><strong>✉️</strong> admin@abedeen.edu.my</p>
                </div>
                <a href="index.php" class="back-home-btn">Back to Home</a>
            </div>
        </div>
    </header>

    <div class="content-wrapper">
        <div class="card">
            <div class="logo-container">
                <img src="logo.png" alt="HR Office Logo" class="logo">
            </div>
            <h1>Register New Admin</h1>
            <?php if (!empty($message)): ?>
                <div class="success-message"><?= htmlspecialchars($message) ?></div>
            <?php endif; ?>
            <form method="post">
                <div class="form-group">
                    <label>Admin Username</label>
                    <input name="username" type="text" required>
                </div>
                <div class="form-group">
                    <label>Admin Password</label>
                    <input name="password" type="password" required>
                </div>
                <div class="form-group">
                    <label>Department (Role)</label>
                    <select name="department" required>
                        <option value="">-- Select Department --</option>
                        <option value="registration">Registration</option>
                        <option value="visa">Visa</option>
                        <option value="finance">Finance</option>
                        <option value="uniform">Uniform</option>
                        <option value="canteen">Canteen</option>
                    </select>
                </div>
                <button type="submit" class="submit-btn">Register Admin</button>
            </form>
        </div>
    </div>
</body>
</html>