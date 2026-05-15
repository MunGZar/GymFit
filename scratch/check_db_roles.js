const { Client } = require('pg');
require('dotenv').config({ path: '../backend/.env' });

async function checkRoles() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'gymfit',
  });

  try {
    await client.connect();
    const res = await client.query('SELECT * FROM rol');
    console.log('Roles in DB:', res.rows);
    
    const users = await client.query('SELECT u.nombre, r.nombre as rol FROM usuario u JOIN rol r ON u.id_rol = r.id_rol');
    console.log('Users and their roles:', users.rows);
    
  } catch (err) {
    console.error('Error connecting to DB:', err);
  } finally {
    await client.end();
  }
}

checkRoles();
