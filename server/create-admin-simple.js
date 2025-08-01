const http = require('http');

const ADMIN_DATA = {
  email: 'admin@projectfolio.com',
  password: 'admin123',
  firstName: 'Admin',
  lastName: 'User'
};

function createAdmin() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(ADMIN_DATA);
    
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/create-admin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(postData);
    req.end();
  });
}

async function runCreateAdmin() {
  console.log('👤 Creating admin user...\n');
  
  try {
    const result = await createAdmin();
    
    if (result.status === 201) {
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email:', ADMIN_DATA.email);
      console.log('🔑 Password:', ADMIN_DATA.password);
      console.log('🎫 Token:', result.data.token);
    } else if (result.status === 400 && result.data.message?.includes('already exists')) {
      console.log('ℹ️  Admin user already exists');
      console.log('📧 Email:', ADMIN_DATA.email);
      console.log('🔑 Password:', ADMIN_DATA.password);
    } else {
      console.log('❌ Failed to create admin user');
      console.log('Status:', result.status);
      console.log('Response:', result.data);
    }
    
    console.log('\n🔗 You can now:');
    console.log('1. Login with these credentials');
    console.log('2. Access the dashboard at /dashboard');
    console.log('3. Post projects without verification');
    
  } catch (error) {
    console.error('❌ Failed to create admin user:', error.message);
  }
}

runCreateAdmin(); 