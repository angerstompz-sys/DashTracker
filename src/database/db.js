import * as SQLite from 'expo-sqlite';

let db = null;

export const initDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync('dashtracker.db');

    // Create tables
    await db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS platforms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        color TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );

      CREATE TABLE IF NOT EXISTS shifts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        platform_id INTEGER NOT NULL,
        start_time DATETIME NOT NULL,
        end_time DATETIME,
        total_earnings REAL DEFAULT 0,
        total_distance REAL DEFAULT 0,
        total_deliveries INTEGER DEFAULT 0,
        notes TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (platform_id) REFERENCES platforms (id)
      );

      CREATE TABLE IF NOT EXISTS deliveries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shift_id INTEGER NOT NULL,
        earnings REAL NOT NULL,
        distance REAL,
        tip REAL DEFAULT 0,
        base_pay REAL DEFAULT 0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        FOREIGN KEY (shift_id) REFERENCES shifts (id)
      );
    `);

    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

// User operations
export const createUser = async (email, name) => {
  const database = getDatabase();
  const result = await database.runAsync(
    'INSERT INTO users (email, name) VALUES (?, ?)',
    [email, name]
  );
  return result.lastInsertRowId;
};

export const getUser = async (email) => {
  const database = getDatabase();
  return await database.getFirstAsync('SELECT * FROM users WHERE email = ?', [email]);
};

// Platform operations
export const addPlatform = async (userId, name, color) => {
  const database = getDatabase();
  const result = await database.runAsync(
    'INSERT INTO platforms (user_id, name, color) VALUES (?, ?, ?)',
    [userId, name, color]
  );
  return result.lastInsertRowId;
};

export const getUserPlatforms = async (userId) => {
  const database = getDatabase();
  return await database.getAllAsync('SELECT * FROM platforms WHERE user_id = ?', [userId]);
};

// Shift operations
export const startShift = async (userId, platformId) => {
  const database = getDatabase();
  const result = await database.runAsync(
    'INSERT INTO shifts (user_id, platform_id, start_time, status) VALUES (?, ?, datetime("now"), "active")',
    [userId, platformId]
  );
  return result.lastInsertRowId;
};

export const endShift = async (shiftId) => {
  const database = getDatabase();
  await database.runAsync(
    'UPDATE shifts SET end_time = datetime("now"), status = "completed" WHERE id = ?',
    [shiftId]
  );
};

export const getActiveShift = async (userId) => {
  const database = getDatabase();
  return await database.getFirstAsync(
    `SELECT s.*, p.name as platform_name, p.color as platform_color
     FROM shifts s
     JOIN platforms p ON s.platform_id = p.id
     WHERE s.user_id = ? AND s.status = "active"`,
    [userId]
  );
};

export const getUserShifts = async (userId, limit = 20) => {
  const database = getDatabase();
  return await database.getAllAsync(
    `SELECT s.*, p.name as platform_name, p.color as platform_color
     FROM shifts s
     JOIN platforms p ON s.platform_id = p.id
     WHERE s.user_id = ?
     ORDER BY s.created_at DESC
     LIMIT ?`,
    [userId, limit]
  );
};

export const updateShiftStats = async (shiftId, earnings, distance, deliveries) => {
  const database = getDatabase();
  await database.runAsync(
    `UPDATE shifts
     SET total_earnings = total_earnings + ?,
         total_distance = total_distance + ?,
         total_deliveries = total_deliveries + ?
     WHERE id = ?`,
    [earnings, distance, deliveries, shiftId]
  );
};

// Delivery operations
export const addDelivery = async (shiftId, earnings, distance, tip, basePay, notes) => {
  const database = getDatabase();
  const result = await database.runAsync(
    'INSERT INTO deliveries (shift_id, earnings, distance, tip, base_pay, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [shiftId, earnings, distance, tip, basePay, notes]
  );

  // Update shift stats
  await updateShiftStats(shiftId, earnings, distance || 0, 1);

  return result.lastInsertRowId;
};

export const getShiftDeliveries = async (shiftId) => {
  const database = getDatabase();
  return await database.getAllAsync(
    'SELECT * FROM deliveries WHERE shift_id = ? ORDER BY timestamp DESC',
    [shiftId]
  );
};

// Analytics
export const getUserStats = async (userId) => {
  const database = getDatabase();
  const stats = await database.getFirstAsync(
    `SELECT
       COUNT(*) as total_shifts,
       SUM(total_earnings) as total_earnings,
       SUM(total_distance) as total_distance,
       SUM(total_deliveries) as total_deliveries,
       AVG(total_earnings) as avg_earnings_per_shift
     FROM shifts
     WHERE user_id = ? AND status = "completed"`,
    [userId]
  );

  return stats;
};
