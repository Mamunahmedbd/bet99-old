const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const url = process.env.MONGOOSE_URL || 'mongodb://127.0.0.1:27017/live_cricket';

async function checkUsers() {
  try {
    await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const UserSchema = new mongoose.Schema({
      username: String,
      isDemo: Boolean,
      role: String
    }, { strict: false });

    const User = mongoose.model('User', UserSchema);

    const users = await User.find({}).limit(5);
    console.log('Recent users:');
    users.forEach(u => console.log(` - ${u.username} (isDemo: ${u.isDemo}, role: ${u.role})`));

    const demoUser = await User.findOne({ isDemo: true });
    if (demoUser) {
      console.log(`Demo user found: ${demoUser.username}`);
    } else {
      console.log('No demo user found.');
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkUsers();




// Demo Login Details
// Username: demo123
// Method: Click the "Login with Demo ID" button on the login page.
// Note: I have fixed a race condition in the frontend code to ensure that clicking this button correctly bypasses the password check and uses the demo identity.
// Administrative Login Details
// If you need to access the dealer/admin panel:

// URL: http://localhost:3000/admin/login
// Username: superadmin
// Password: password123 -> P@$$mamUN1
// Transaction Password: password123
