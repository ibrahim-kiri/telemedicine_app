const { promisePool } = require('../config/db');

exports.getProfile = async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT id, first_name, last_name, email, specialization FROM users WHERE id = ?', [req.session.userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  const { firstName, lastName, specialization } = req.body;
  try {
    await promisePool.query('UPDATE users SET first_name = ?, last_name = ?, specialization = ? WHERE id = ?', 
      [firstName, lastName, specialization, req.session.userId]);
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
             p.first_name AS patient_first_name, p.last_name AS patient_last_name
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      WHERE a.doctor_id = ?
    `, [req.session.userId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};