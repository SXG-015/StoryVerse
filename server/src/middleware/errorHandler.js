/**
 * Central error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', err.message);

    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    // PostgreSQL unique constraint violation
    if (err.code === '23505') {
        const field = err.constraint?.includes('email') ? 'email' : 'username';
        return res.status(409).json({
            error: `An account with this ${field} already exists.`,
        });
    }

    // PostgreSQL foreign key violation
    if (err.code === '23503') {
        return res.status(400).json({
            error: 'Referenced resource does not exist.',
        });
    }

    // Validation errors from express-validator
    if (err.type === 'validation') {
        return res.status(400).json({
            error: 'Validation failed.',
            details: err.errors,
        });
    }

    // Default server error
    res.status(err.statusCode || 500).json({
        error: err.message || 'An unexpected server error occurred.',
    });
};

module.exports = errorHandler;
