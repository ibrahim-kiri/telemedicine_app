document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const logoutLink = document.getElementById('logoutLink');
    const searchForm = document.getElementById('searchForm');
    const updateProfileForm = document.getElementById('updateProfileForm');

    // Fetch Profile Data
    const fetchProfile = async () => {
        try {
            const response = await fetch('/patient/profile', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const profileData = await response.json();
                
                // Populate the profile data into the HTML
                document.getElementById('patientName').textContent = `${profileData.first_name} ${profileData.last_name}`;
                document.getElementById('patientEmail').textContent = profileData.email;
            } else {
                console.error('Failed to fetch profile data.');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    // Fetch profile on page load
    fetchProfile();

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch('/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'CSRF-Token': getCookie('XSRF-TOKEN')
                    },
                    body: JSON.stringify({ email, password }),
                });
                const data = await response.json();
                if (response.ok) {
                    alert(data.message);
                    if (data.role === 'patient') {
                        window.location.href = '/patient-dashboard';
                    } else if (data.role === 'doctor') {
                        window.location.href = '/doctor-dashboard';
                    } else if (data.role === 'admin') {
                        window.location.href = '/admin-dashboard';
                    }
                } else {
                    alert('Login failed: ' + data.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;
            
            try {
                const response = await fetch('/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'CSRF-Token': getCookie('XSRF-TOKEN')
                    },
                    body: JSON.stringify({ firstName, lastName, email, phone, password, role }),
                });
                const data = await response.json();
                if (response.ok) {
                    alert(data.message);
                    window.location.href = '/';
                } else {
                    alert('Registration failed: ' + data.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            }
        });
    }

    if (logoutLink) {
        logoutLink.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                const response = await fetch('/auth/logout', {
                    method: 'POST',
                    headers: {
                        'CSRF-Token': getCookie('XSRF-TOKEN')
                    },
                });
                const data = await response.json();
                if (response.ok) {
                    alert(data.message);
                    window.location.href = '/';
                } else {
                    alert('Logout failed: ' + data.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            }
        });
    }

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const search = document.getElementById('searchInput').value;
        const status = document.getElementById('statusFilter').value;
        
        const response = await fetch(`/admin/patients?search=${search}&status=${status}`);
        const patients = await response.json();
        
        const patientTableBody = document.querySelector('#patientTable tbody');
        patientTableBody.innerHTML = '';
        
        patients.forEach(patient => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${patient.first_name} ${patient.last_name}</td>
            <td>${patient.email}</td>
            <td>${patient.role}</td>
          `;
          patientTableBody.appendChild(row);
        });
    });

    updateProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        
        try {
          const response = await fetch('/patient/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ firstName, lastName }),
          });
          
          const data = await response.json();
          if (response.ok) {
            alert('Profile updated successfully');
          } else {
            alert('Update failed: ' + data.message);
          }
        } catch (error) {
          console.error('Error:', error);
          alert('An error occurred. Please try again.');
        }
    });
});

document.addEventListener('DOMContentLoaded', async () => {
    try {
      // Fetch the patient's profile data
      const response = await fetch('/patient/profile');
      const profile = await response.json();
      
      if (response.ok) {
        // Pre-populate the form fields with the fetched profile data
        document.getElementById('firstName').value = profile.first_name;
        document.getElementById('lastName').value = profile.last_name;
        document.getElementById('email').value = profile.email;
      } else {
        alert('Failed to load profile data: ' + profile.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
});
  
document.getElementById('updateProfileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
  
    try {
      const response = await fetch('/patient/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName }),
      });
  
      const data = await response.json();
      if (response.ok) {
        alert('Profile updated successfully');
      } else {
        alert('Update failed: ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
});

document.getElementById('deleteAccountButton').addEventListener('click', async () => {
    if (confirm('Are you sure you want to delete your account? This action is irreversible.')) {
      try {
        const response = await fetch('/patient/profile', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const data = await response.json();
        if (response.ok) {
          alert('Account deleted successfully');
          window.location.href = '/';
        } else {
          alert('Deletion failed: ' + data.message);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
      }
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    await loadDoctors();

    async function loadDoctors() {
        try {
            const response = await fetch('/patient/doctors');
            const doctors = await response.json();
            
            const doctorSelect = document.getElementById('doctor');
            doctors.forEach(doctor => {
                const option = document.createElement('option');
                option.value = doctor.id;
                option.textContent = `${doctor.first_name} ${doctor.last_name}`;
                doctorSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading doctors:', error);
        }
    }
});


document.addEventListener('DOMContentLoaded', async () => {
    await loadAppointments();

    // Function to load appointments into the list
    async function loadAppointments() {
        try {
            const response = await fetch('/patient/appointments', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const appointments = await response.json();
                
                const appointmentList = document.getElementById('appointmentList');
                appointmentList.innerHTML = ''; // Clear the list before adding new appointments

                // Check if appointments exist
                if (appointments.length === 0) {
                    appointmentList.innerHTML = '<li>No appointments found.</li>';
                } else {
                    // Loop through the appointments and display each one
                    appointments.forEach(appointment => {
                        const listItem = document.createElement('li');
                        const appointmentDate = appointment.appointment_date;
                        const doctorName = `${appointment.doctor_first_name} ${appointment.doctor_last_name}`;

                        // Display the appointment details
                        listItem.textContent = `${appointmentDate} - Dr. ${doctorName} (${appointment.status})`;
                        appointmentList.appendChild(listItem);
                    });
                }
            } else {
                console.error('Failed to fetch appointments');
                const appointmentList = document.getElementById('appointmentList');
                appointmentList.innerHTML = '<li>Error loading appointments.</li>';
            }
        } catch (error) {
            console.error('Error loading appointments:', error);
            const appointmentList = document.getElementById('appointmentList');
            appointmentList.innerHTML = '<li>Error loading appointments.</li>';
        }
    }
});


// Function to get a cookie by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

document.addEventListener('DOMContentLoaded', () => {
    const csrfToken = getCookie('XSRF-TOKEN'); // Retrieve CSRF token from cookies
    document.getElementById('csrfToken').value = csrfToken; // Set it in the hidden input field

    const form = document.getElementById('bookAppointmentForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const doctorId = document.getElementById('doctor').value;
        console.log('Selected Doctor ID:', doctorId); // Log the selected doctor ID

        const appointmentDate = document.getElementById('appointmentDate').value;
        const appointmentTime = document.getElementById('appointmentTime').value;

        const response = await fetch('/patient/appointments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify({ doctorId, appointmentDate, appointmentTime })
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data.message); // Handle success
        } else {
            console.error('Error booking appointment:', response.statusText);
        }
    });
});

