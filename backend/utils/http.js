function createHttpError(status, message, details) {
  const error = new Error(message);
  error.status = status;
  if (details) error.details = details;
  return error;
}

function handleControllerError(res, error) {
  if (error.status) {
    return res.status(error.status).json({
      ok: false,
      error: error.message,
      ...(error.details ? { details: error.details } : {}),
    });
  }

  if (
    error.code === "SQLITE_CONSTRAINT_UNIQUE" ||
    error.code === "SQLITE_CONSTRAINT_PRIMARYKEY"
  ) {
    return res.status(409).json({
      ok: false,
      error: "El registro entra en conflicto con un dato único existente.",
    });
  }

  if (
    error.code?.startsWith("SQLITE_CONSTRAINT") ||
    error.code === "SQLITE_MISMATCH"
  ) {
    return res.status(400).json({
      ok: false,
      error: "Los datos no cumplen las reglas de la base de datos.",
      details: error.message,
    });
  }

  console.error(error);
  return res.status(500).json({
    ok: false,
    error: "Error interno del servidor.",
  });
}

function requireFields(body, fields) {
  const missing = fields.filter(
    (field) =>
      body[field] === undefined ||
      body[field] === null ||
      (typeof body[field] === "string" && body[field].trim() === "")
  );

  if (missing.length) {
    throw createHttpError(
      400,
      `Faltan campos obligatorios: ${missing.join(", ")}.`
    );
  }
}

function parsePositiveId(value, label = "id") {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw createHttpError(400, `${label} debe ser un entero positivo.`);
  }
  return id;
}

module.exports = {
  createHttpError,
  handleControllerError,
  requireFields,
  parsePositiveId,
};
