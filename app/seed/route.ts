import bcrypt from 'bcrypt';
import mysql from 'mysql'
import { invoices, customers, revenue, users } from '../lib/placeholder-data';

const client = mysql.createConnection({
  host: 'localhost',
  user: 'stiven',
  password:'3883',
  database: 'test'
});

// const client = await db.connect();

async function seedUsers() {
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id CHAR(36) DEFAULT uuid() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `);

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return client.query(`
        INSERT INTO users (id, name, email, password)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE id = id; 
      `, [user.id, user.name, user.email, hashedPassword]);
    }),
  );

  return insertedUsers;
}

async function seedInvoices() {
  await client.query(`
    CREATE TABLE IF NOT EXISTS invoices (
      id CHAR(36) DEFAULT (UUID()) PRIMARY KEY,
      customer_id CHAR(36) NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `);

  const insertedInvoices = await Promise.all(
    invoices.map(
      (invoice) => client.query(`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE id=id;
      `, [invoice.customer_id, invoice.amount, invoice.status, invoice.date]),
    ),
  );

  return insertedInvoices;
}

async function seedCustomers() {
  await client.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id CHAR(36) DEFAULT (UUID()) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `);

  const insertedCustomers = await Promise.all(
    customers.map(
      (customer) => client.query(`
        INSERT INTO customers (id, name, email, image_url)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE id=id;
      `, [customer.id, customer.name, customer.email, customer.image_url]),
    ),
  );

  return insertedCustomers;
}

async function seedRevenue() {
  await client.query(`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `);

  const insertedRevenue = await Promise.all(
    revenue.map(
      (rev) => client.query(`
        INSERT INTO revenue (month, revenue)
        VALUES (?, ?)
        ON CONFLICT (month) DO NOTHING;
      `, [rev.month, rev.revenue]),
    ),
  );

  return insertedRevenue;
}

export async function GET() {
  try {
    await client.query('BEGIN');
    await seedUsers();
    await seedCustomers();
    await seedInvoices();
    await seedRevenue();
    await client.query('COMMIT');

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    return Response.json({ error }, { status: 500 });
  }
}
