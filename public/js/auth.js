const form = document.getElementById('login-form');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('token', data.token);
            window.location.href = '/';
        } else {
            alert(data.msg || 'Login failed');
        }
    } catch (err) {
        console.error(err);
        alert('An error occurred');
    }
});
