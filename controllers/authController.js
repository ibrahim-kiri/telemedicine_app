const bcrypt = require('bcrypt');
const { promisePool } = require('../config/db');

exports.register = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    role,
    phone,
    dateOfBirth,
    gender,
    address,
    specialization,
    schedule,
  } = req.body;

  try {
    // Check if the user already exists
    const [existingUser] = await promisePool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    let roleId, roleIdColumn;

    // Role-specific logic: patient, doctor, admin
    if (role === 'patient') {
      // Insert into Patients table
      const [patientResult] = await promisePool.query(
        'INSERT INTO patients (first_name, last_name, phone, date_of_birth, gender, address) VALUES (?, ?, ?, ?, ?, ?)', 
        [firstName, lastName, phone, dateOfBirth, gender, address]
      );
      roleId = patientResult.insertId;
      roleIdColumn = 'patient_id'; // Column in Users table
    } else if (role === 'doctor') {
      // Insert into Doctors table
      const [doctorResult] = await promisePool.query(
        'INSERT INTO doctors (first_name, last_name, email, phone, specialization, schedule) VALUES (?, ?, ?, ?, ?, ?)', 
        [firstName, lastName, email, phone, specialization, schedule]
      );
      roleId = doctorResult.insertId;
      roleIdColumn = 'doctor_id'; // Column in Users table
    } else if (role === 'admin') {
      // Insert into Admins table
      const [adminResult] = await promisePool.query(
        'INSERT INTO admins (first_name, last_name) VALUES (?, ?)', 
        [firstName, lastName]
      );
      roleId = adminResult.insertId;
      roleIdColumn = 'admin_id'; // Column in Users table
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Insert into Users table
    let userQuery = `INSERT INTO users (first_name, last_name, email, password, role`;
    let userValues = [firstName, lastName, email, hashedPassword, role];
    
    if (roleIdColumn && roleId) {
      userQuery += `, ${roleIdColumn}) VALUES (?, ?, ?, ?, ?, ?)`;
      userValues.push(roleId);
    } else {
      userQuery += `) VALUES (?, ?, ?, ?, ?)`;
    }

    await promisePool.query(userQuery, userValues);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await promisePool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    req.session.userId = user.id;
    req.session.role = user.role;
    res.json({ message: 'Login successful', role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Could not log out, please try again' });
    }
    res.json({ message: 'Logout successful' });
  });
};