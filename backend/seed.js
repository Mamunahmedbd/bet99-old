const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const url = process.env.MONGOOSE_URL || 'mongodb://127.0.0.1:27017/live_cricket';

async function seed() {
  try {
    await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const UserSchema = new mongoose.Schema({
      username: String,
      password: { type: String, expose: false },
      role: String,
      isDemo: Boolean,
      isLogin: { type: Boolean, default: true },
      isDeleted: { type: Boolean, default: false },
      transactionPassword: String,
      parentStr: Array,
      level: Number
    }, { strict: false, timestamps: true });

    // Mimic the pre-save hook for password hashing
    UserSchema.pre('save', function (next) {
      if (!this.isModified('password') && !this.isModified('transactionPassword')) return next();

      if (this.isModified('password')) {
        const salt = bcrypt.genSaltSync(10);
        this.password = bcrypt.hashSync(this.password, salt);
      }

      if (this.isModified('transactionPassword')) {
        const salt = bcrypt.genSaltSync(10);
        this.transactionPassword = bcrypt.hashSync(this.transactionPassword, salt);
      }
      next();
    });

    const User = mongoose.model('User', UserSchema);

    // Create Super Admin
    let superadmin = await User.findOne({ username: 'superadmin' });
    if (!superadmin) {
      superadmin = new User({
        username: 'superadmin',
        password: 'password123',
        role: 'admin',
        level: 0,
        isLogin: true,
        transactionPassword: 'password123'
      });
      await superadmin.save();
      console.log('Super Admin created: superadmin / password123');
    } else {
      console.log('Super Admin already exists');
    }

    // Create Demo User
    let demoUser = await User.findOne({ isDemo: true });
    if (!demoUser) {
      demoUser = new User({
        username: 'demo123',
        password: 'demopassword', // Though not checked for demo
        role: 'user',
        isDemo: true,
        isLogin: true,
        level: 1,
        parentId: superadmin._id,
        parentStr: [superadmin._id.toString()]
      });
      await demoUser.save();
      console.log('Demo user created: demo123 (Login via "Login with Demo ID" button)');
    } else {
      console.log(`Demo user already exists: ${demoUser.username}`);
    }

    // Initialize Balance for demo user if Balance model exists
    const BalanceSchema = new mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      balance: { type: Number, default: 0 },
      exposer: { type: Number, default: 0 },
      mainBalance: { type: Number, default: 0 }
    }, { strict: false });
    const Balance = mongoose.model('Balance', BalanceSchema);

    const demoBalance = await Balance.findOne({ userId: demoUser._id });
    if (!demoBalance) {
      await Balance.create({
        userId: demoUser._id,
        balance: 100000,
        mainBalance: 100000,
        exposer: 0
      });
      console.log('Initial balance of 100,000 added to demo user');
    }

    await mongoose.disconnect();
    console.log('Seeding completed successfully');
  } catch (err) {
    console.error('Error during seeding:', err);
  }
}

seed();
