const db = require('./src/config/db');

async function migrate() {
    try {
        console.log('Running migration to add story_comments table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS story_comments (
                id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                story_id        UUID         NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
                user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                content         TEXT         NOT NULL,
                created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            CREATE INDEX IF NOT EXISTS idx_comments_story ON story_comments(story_id);
            CREATE INDEX IF NOT EXISTS idx_comments_created ON story_comments(created_at DESC);
        `);
        console.log('Migration successful.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
