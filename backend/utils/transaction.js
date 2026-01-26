/**
 * Transaction Utility
 * Provides transaction support for SQL.js database operations
 * SQL.js doesn't support native transactions, so we implement
 * atomic operations with savepoints for rollback on failure
 */

const logger = require('./logger');

/**
 * Execute multiple database operations in a transaction
 * Uses savepoints for transaction-like behavior in SQL.js
 * @param {object} db - SQL.js database instance
 * @param {Array<Function>} operations - Array of async operations to execute
 * @returns {Promise<Array>} Results from all operations
 */
async function withTransaction(db, operations) {
  const savepointName = `txn_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const results = [];

  try {
    // Create savepoint for transaction-like behavior
    db.exec(`SAVEPOINT ${savepointName}`);

    // Execute all operations sequentially
    for (const operation of operations) {
      const result = await operation(db);
      results.push(result);
    }

    // Release savepoint (commit)
    db.exec(`RELEASE SAVEPOINT ${savepointName}`);

    logger.debug('Transaction committed', { savepoint: savepointName, operations: operations.length });

    return results;
  } catch (error) {
    // Rollback to savepoint on error
    try {
      db.exec(`ROLLBACK TO SAVEPOINT ${savepointName}`);
      db.exec(`RELEASE SAVEPOINT ${savepointName}`);
    } catch (rollbackError) {
      logger.error('Failed to rollback transaction', {
        savepoint: savepointName,
        error: rollbackError.message
      });
    }

    logger.error('Transaction rolled back', {
      savepoint: savepointName,
      error: error.message,
      operations: operations.length
    });

    throw error;
  }
}

/**
 * Wrapper for transactional operations with proper error handling
 * Use this to create transactional versions of service methods
 * @param {Function} operationsFn - Function that returns array of operations
 * @returns {Function} Transactional wrapper function
 */
function transactional(operationsFn) {
  return async (db, ...args) => {
    return withTransaction(db, () => operationsFn(...args));
  };
}

/**
 * Execute operations with automatic retry on deadlock
 * @param {object} db - SQL.js database instance
 * @param {Function} operation - Operation to execute
 * @param {number} maxRetries - Maximum number of retries
 * @returns {Promise<any>} Result from operation
 */
async function withRetry(db, operation, maxRetries = 3) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation(db);
    } catch (error) {
      lastError = error;

      // Don't retry on certain errors
      if (error.message.includes('UNIQUE constraint') ||
          error.message.includes('FOREIGN KEY constraint')) {
        throw error;
      }

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 100; // Exponential backoff
        logger.debug('Retrying operation', { attempt, delay: `${delay}ms` });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Create a batch insert operation for transaction
 * @param {string} table - Table name
 * @param {Array<object>} data - Array of data objects
 * @param {Array<string>} columns - Column names
 * @returns {Function} Operation function for use in withTransaction
 */
function batchInsert(table, data, columns) {
  return async (db) => {
    if (data.length === 0) return 0;

    const placeholders = columns.map(() => '?').join(',');
    const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;

    let inserted = 0;
    for (const row of data) {
      const values = columns.map(col => row[col]);
      db.run(sql, values);
      inserted++;
    }

    return inserted;
  };
}

/**
 * Create a batch update operation for transaction
 * @param {string} table - Table name
 * @param {Array<string>} columns - Columns to update
 * @param {string} whereColumn - Where clause column
 * @returns {Function} Operation function for use in withTransaction
 */
function batchUpdate(table, columns, whereColumn) {
  return async (db, updates) => {
    if (updates.length === 0) return 0;

    const setClause = columns.map(col => `${col} = ?`).join(', ');
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereColumn} = ?`;

    let updated = 0;
    for (const row of updates) {
      const whereValue = row[whereColumn];
      const values = [...columns.map(col => row[col]), whereValue];
      db.run(sql, values);
      updated++;
    }

    return updated;
  };
}

/**
 * Execute a callback with database instance
 * Convenience wrapper for database operations
 * @param {object} dbWrapper - Database wrapper (from database.js)
 * @param {Function} callback - Callback function with db instance
 * @returns {Promise<any>} Result from callback
 */
async function withDatabase(dbWrapper, callback) {
  const db = await dbWrapper.ready;
  return callback(db);
}

module.exports = {
  withTransaction,
  transactional,
  withRetry,
  batchInsert,
  batchUpdate,
  withDatabase
};
