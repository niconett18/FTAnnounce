/**
 * cassandra.js — Koneksi ke Apache Cassandra & Inisialisasi Schema
 */

const cassandra = require('cassandra-driver');
require('dotenv').config();

const systemClient = new cassandra.Client({
  contactPoints: (process.env.CASSANDRA_CONTACT_POINTS || '127.0.0.1').split(','),
  localDataCenter: process.env.CASSANDRA_LOCAL_DC || 'datacenter1',
});

const client = new cassandra.Client({
  contactPoints: (process.env.CASSANDRA_CONTACT_POINTS || '127.0.0.1').split(','),
  localDataCenter: process.env.CASSANDRA_LOCAL_DC || 'datacenter1',
  keyspace: process.env.CASSANDRA_KEYSPACE || 'ftannounce',
});

async function initializeDatabase() {
  console.log('🔌 Menghubungkan ke Cassandra...');
  
  await systemClient.connect();
  console.log('✅ Terhubung ke Cassandra cluster');

  await systemClient.execute(`
    CREATE KEYSPACE IF NOT EXISTS ftannounce
    WITH replication = {
      'class': 'SimpleStrategy',
      'replication_factor': 1
    }
  `);
  console.log('✅ Keyspace "ftannounce" siap');

  await systemClient.shutdown();
  await client.connect();

  // Tabel utama — WIDE-COLUMN STORE DESIGN
  await client.execute(`
    CREATE TABLE IF NOT EXISTS announcements_by_channel (
      channel_id          TEXT,
      month_year_bucket   TEXT,
      created_at          TIMESTAMP,
      id                  UUID,
      author_name         TEXT,
      author_role         TEXT,
      author_account_type TEXT,
      title               TEXT,
      content             TEXT,
      priority            TEXT,
      attachment_url      LIST<TEXT>,
      pin_until           TIMESTAMP,
      PRIMARY KEY ((channel_id, month_year_bucket), created_at, id)
    ) WITH CLUSTERING ORDER BY (created_at DESC)
  `);
  console.log('✅ Tabel "announcements_by_channel" siap');

  // Tabel admin
  await client.execute(`
    CREATE TABLE IF NOT EXISTS admins (
      username        TEXT PRIMARY KEY,
      password_hash   TEXT,
      display_name    TEXT,
      account_type    TEXT,
      role_title      TEXT,
      profile_picture TEXT
    )
  `);
  console.log('✅ Tabel "admins" siap');

  console.log('🎉 Database fully initialized!');
}

module.exports = { client, initializeDatabase, types: cassandra.types };
