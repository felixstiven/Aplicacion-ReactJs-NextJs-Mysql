// import { db } from "@vercel/postgres";

import mysql from 'mysql';
import { env } from 'process';

const client = mysql.createConnection({
  host: 'localhost', 
  user: env.MYSQL_USER,
  password: env.MYSQL_PASSWORD, 
  database: 'test'
});

client.connect((err) => {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected as id ' + client.threadId);
});

async function listInvoices() {
  const [data] = await new Promise<any[]>((resolve, reject) => {
    client.query(`
      SELECT invoices.amount, customers.name
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE invoices.amount = 666;
    `, (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });

  return data;
}

export async function GET() {
  
  try {
  	return Response.json(await listInvoices());
  } catch (error) {
  	return Response.json({ error }, { status: 500 });
  }
}
