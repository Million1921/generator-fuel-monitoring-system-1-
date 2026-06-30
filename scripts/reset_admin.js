const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      throw new Error('Set ADMIN_PASSWORD before resetting the admin user.');
    }

    if (process.env.CONFIRM_USER_RESET !== 'YES') {
      throw new Error('Set CONFIRM_USER_RESET=YES before deleting and recreating users.');
    }

    // First list existing users
    const users = await p.user.findMany({ select: { id: true, email: true, name: true, role: true } });
    console.log('=== EXISTING USERS ===');
    users.forEach(u => console.log(`  ID: ${u.id}, Email: ${u.email}, Name: ${u.name}, Role: ${u.role}`));

    // Check accounts
    const accounts = await p.account.findMany();
    console.log('\n=== EXISTING ACCOUNTS ===');
    accounts.forEach(a => console.log(`  ID: ${a.id}, Provider: ${a.providerId}, UserId: ${a.userId}, HasPassword: ${!!a.password}`));

    // Delete ALL existing users to start fresh
    console.log('\nDeleting all existing sessions, accounts, and users...');
    await p.session.deleteMany({});
    await p.account.deleteMany({});
    // Check for technician references
    const techs = await p.technician.findMany({ where: { userId: { not: null } } });
    for (const tech of techs) {
      await p.technician.update({ where: { id: tech.id }, data: { userId: null } });
    }
    await p.user.deleteMany({});
    console.log('Deleted all users.');

    console.log('\n=== Creating admin via better-auth sign-up API ===');
    
    const response = await fetch('http://localhost:3000/api/auth/sign-up/email', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
        'Referer': 'http://localhost:3000/login',
      },
      body: JSON.stringify({
        email: 'admin@ethiotelecom.et',
        password: adminPassword,
        name: 'System Admin',
      }),
    });

    const text = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', text);

    if (response.ok) {
      // Update the user role to ADMIN
      const updatedUser = await p.user.update({
        where: { email: 'admin@ethiotelecom.et' },
        data: { role: 'ADMIN' },
      });
      console.log('\nUpdated user role to ADMIN');
      
      console.log('\n=============================');
      console.log('  LOGIN CREDENTIALS:');
      console.log('  Email:    admin@ethiotelecom.et');
      console.log('=============================');
    } else {
      console.error('\nFailed to create admin user. Trying alternative approach...');
      
      // Alternative: use better-auth's internal hash
      // We need to hash the password the same way better-auth does (scrypt)
      const crypto = require('crypto');
      const { promisify } = require('util');
      const scryptAsync = promisify(crypto.scrypt);
      
      // better-auth uses bcrypt-like hashing via its internal utilities
      // Let's just create user with a known bcrypt hash
      const salt = crypto.randomBytes(16).toString('hex');
      const derivedKey = await scryptAsync(adminPassword, salt, 64);
      const hashedPassword = salt + ':' + derivedKey.toString('hex');
      
      const newUser = await p.user.create({
        data: {
          email: 'admin@ethiotelecom.et',
          name: 'System Admin',
          role: 'ADMIN',
          emailVerified: true,
        }
      });
      
      // Create the account entry that better-auth uses
      await p.account.create({
        data: {
          accountId: newUser.id,
          providerId: 'credential',
          userId: newUser.id,
          password: hashedPassword,
        }
      });
      
      console.log('\nCreated user and account via direct DB insert.');
      console.log('NOTE: Password hash may not match better-auth format.');
      console.log('Testing login...');
      
      const loginResp = await fetch('http://localhost:3000/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:3000',
          'Referer': 'http://localhost:3000/login',
        },
        body: JSON.stringify({
          email: 'admin@ethiotelecom.et',
          password: adminPassword,
        }),
      });
      console.log('Login test status:', loginResp.status);
      const loginText = await loginResp.text();
      console.log('Login response:', loginText);
    }
  } catch (e) {
    console.error('ERROR:', e.message);
    console.error(e.stack);
  } finally {
    await p.$disconnect();
  }
}

main();
