async function testAdminLogin() {
  try {
    console.log('Testing admin login...');
    
    const response = await fetch('http://localhost:3004/api/auth/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    const data = await response.json();
    console.log('Login response status:', response.status);
    console.log('Login response:', data);

    if (data.success && data.token) {
      console.log('\nTesting merchants endpoint with token...');
      
      const merchantsResponse = await fetch('http://localhost:3004/api/admin/merchants', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${data.token}`,
          'Content-Type': 'application/json'
        }
      });

      const merchantsData = await merchantsResponse.json();
      console.log('Merchants response status:', merchantsResponse.status);
      console.log('Merchants response:', merchantsData);
    } else {
      console.log('Login failed, cannot test merchants endpoint');
    }
  } catch (error) {
    console.error('Error testing admin login:', error);
  }
}

testAdminLogin();