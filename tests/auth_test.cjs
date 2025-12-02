const BASE_URL = 'http://localhost:3000/api/auth';
let cookie = '';

async function testAuth() {
    console.log('🧪 Starting Auth Tests...');

    // 1. Register
    try {
        console.log('\n1. Testing Register...');
        const username = `u${Date.now().toString().slice(-8)}`;
        const res = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                password: 'Password123!',
                email: `${username}@example.com`
            })
        });

        const data = await res.json();

        if (res.ok) {
            console.log('✅ Register Success:', data.message);
            // Extract cookie
            const cookies = res.headers.get('set-cookie');
            if (cookies) {
                cookie = cookies.split(';')[0];
                console.log('✅ Cookie received:', cookie);
            }
        } else {
            console.error('❌ Register Failed:', data);
        }
    } catch (error) {
        console.error('❌ Register Error:', error.message);
    }

    // 3. Get Me (using cookie)
    try {
        console.log('\n3. Testing Get Me (with cookie)...');
        const res = await fetch(`${BASE_URL}/me`, {
            headers: {
                'Cookie': cookie
            }
        });
        const data = await res.json();

        if (res.ok) {
            console.log('✅ Get Me Success:', data.user.username);
        } else {
            console.error('❌ Get Me Failed:', data);
        }
    } catch (error) {
        console.error('❌ Get Me Error:', error.message);
    }

    // 4. Logout
    try {
        console.log('\n4. Testing Logout...');
        const res = await fetch(`${BASE_URL}/logout`, {
            method: 'POST'
        });
        const data = await res.json();
        if (res.ok) {
            console.log('✅ Logout Success:', data.message);
        } else {
            console.error('❌ Logout Failed:', data);
        }
    } catch (error) {
        console.error('❌ Logout Error:', error.message);
    }
}

testAuth();
