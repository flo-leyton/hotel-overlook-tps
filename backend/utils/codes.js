function generarCodigo(db, table, column, prefix) {
  const prefixWithDash = `${prefix}-`;
  const row = db
    .prepare(
      `SELECT MAX(CAST(SUBSTR(${column}, ?) AS INTEGER)) AS maximo
       FROM ${table}
       WHERE ${column} LIKE ?`
    )
    .get(prefixWithDash.length + 1, `${prefixWithDash}%`);

  return `${prefixWithDash}${String((row.maximo || 0) + 1).padStart(4, "0")}`;
}

module.exports = { generarCodigo };
