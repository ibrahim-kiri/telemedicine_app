const { promisePool } = require('../config/db');

exports.bookAppointment = async (req, res) => {
  const { doctorId, appointmentDate, appointmentTime } = req.body;

  // Log the doctor ID for debugging
  console.log('Received Doctor ID:', doctorId);

  // Check if all required fields are provided
  if (!doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
      const patientId = req.session.userId;

      if (!patientId) {
          return res.status(401).json({ message: 'Unauthorized: No patient ID found.' });
      }

      // Ensure the doctor ID exists in the database
      const [doctorCheck] = await promisePool.query('SELECT id FROM doctors WHERE id = ?', [doctorId]);
      if (doctorCheck.length === 0) {
          return res.status(400).json({ message: 'Invalid doctor ID.' });
      }

      // Insert the appointment into the database
      const [result] = await promisePool.query(
          'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status) VALUES (?, ?, ?, ?, ?)',
          [patientId, doctorId, appointmentDate, appointmentTime, 'scheduled']
      );

      res.status(201).json({ message: 'Appointment booked successfully', appointmentId: result.insertId });
  } catch (error) {
      console.error('Error booking appointment:', error);
      res.status(500).json({ message: 'Server error' });
  }
};


exports.getAvailableSlots = async (req, res) => {
  const { doctorId, date } = req.query;
  try {
    const [bookedSlots] = await promisePool.query(
      'SELECT appointment_time FROM appointments WHERE doctor_id = ? AND appointment_date = ?',
      [doctorId, date]
    );
    
    // Generate all possible time slots (e.g., every 30 minutes from 9 AM to 5 PM)
    const allSlots = generateTimeSlots('09:00', '17:00', 30);
    
    // Filter out booked slots
    const availableSlots = allSlots.filter(slot => 
      !bookedSlots.some(bookedSlot => bookedSlot.appointment_time === slot)
    );
    
    res.json(availableSlots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateAppointment = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await promisePool.query('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Appointment updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.cancelAppointment = async (req, res) => {
  const { id } = req.params;
  try {
    await promisePool.query('UPDATE appointments SET status = ? WHERE id = ?', ['cancelled', id]);
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

function generateTimeSlots(start, end, intervalMinutes) {
  const slots = [];
  let current = new Date(`2000-01-01T${start}`);
  const endTime = new Date(`2000-01-01T${end}`);
  
  while (current < endTime) {
    slots.push(current.toTimeString().slice(0, 5));
    current.setMinutes(current.getMinutes() + intervalMinutes);
  }
  
  return slots;
}