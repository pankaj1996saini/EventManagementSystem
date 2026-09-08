// Optional helper script: creates a default admin account and a few starter
// categories so the app is usable immediately after setup.
// This does NOT create any events or registrations - all such data
// must be created through the application itself.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');

const run = async () => {
  await connectDB();

  const adminEmail = 'admin@eventms.com';
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: 'Admin@123',
      role: 'admin',
    });
    console.log(`Admin created -> email: ${adminEmail} / password: Admin@123`);
  } else {
    console.log('Admin already exists, skipping.');
  }

  const defaultCategories = ['Technology', 'Music', 'Sports', 'Business', 'Education', 'Arts'];
  for (const name of defaultCategories) {
    const exists = await Category.findOne({ name });
    if (!exists) {
      await Category.create({ name });
    }
  }
  console.log('Default categories ensured.');

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
