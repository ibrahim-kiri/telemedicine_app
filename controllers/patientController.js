const { promisePool } = require('../config/db');

exports.getProfile = async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT first_name, last_name, email FROM users WHERE id = ?', [req.session.userId]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Profile not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDoctors = async (req, res) => {
  try {
    const [doctors] = await promisePool.query('SELECT id, first_name, last_name FROM doctors');
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Server error while fetching doctors' });
  }
};

exports.updateProfile = async (req, res) => {
  const { firstName, lastName } = req.body;
  try {
    await promisePool.query('UPDATE users SET first_name = ?, last_name = ? WHERE id = ?', [firstName, lastName, req.session.userId]);
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const [rows] = await promisePool.query(`
      SELECT a.id, a.appointment_date, a.appointment_time, a.status, 
             d.first_name AS doctor_first_name, d.last_name AS doctor_last_name
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id  -- Ensure you are joining with the doctors table
      WHERE a.patient_id = ?
    `, [req.session.userId]);
    
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.createAppointment = async (req, res) => {
  try {
      const { date, doctorId } = req.body;
      const patientId = req.user.id;
      const newAppointment = new Appointment({
          date,
          doctor: doctorId,
          patient: patientId,
          status: 'scheduled',
      });

      await newAppointment.save();
      res.status(201).json({ message: 'Appointment created successfully' });
  } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(500).json({ message: 'Error creating appointment' });
  }
};

exports.getPatients = async (req, res) => {
  try {
    const { search, role, status } = req.query;
    let query = 'SELECT id, first_name, last_name, email, role FROM users WHERE role = "patient"';
    const params = [];

    if (search) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    const [rows] = await promisePool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    await promisePool.query('DELETE FROM users WHERE id = ?', [req.session.userId]);
    req.session.destroy();
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};