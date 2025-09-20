const form = document.getElementById('register-form');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            alert('Registration successful! Please login.');
            window.location.href = '/login.html';
        } else {
            alert(data.msg || data.errors.map(e => e.msg).join(', ') || 'Registration failed');
        }
    } catch (err) {
        console.error(err);
        alert('An error occurred');
    }
});
