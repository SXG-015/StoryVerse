-- ============================================================
-- StoryVerse Phase 1 — Database Schema
-- PostgreSQL Relational Schema for Users, Stories, and Chapters
-- ============================================================

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM ('reader', 'writer');
CREATE TYPE story_status AS ENUM ('ongoing', 'completed');
CREATE TYPE chapter_status AS ENUM ('draft', 'published');

-- ============================================================
-- USERS TABLE
-- ============================================================

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username        VARCHAR(50)  NOT NULL UNIQUE,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            user_role    NOT NULL DEFAULT 'reader',
    display_name    VARCHAR(100),
    bio             TEXT         DEFAULT '',
    avatar_url      VARCHAR(500) DEFAULT '',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for quick lookups on login
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- ============================================================
-- STORIES TABLE
-- ============================================================

CREATE TABLE stories (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id       UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(200) NOT NULL,
    description     TEXT         DEFAULT '',
    cover_image_url VARCHAR(500) DEFAULT '',
    genre           VARCHAR(50)  DEFAULT 'General',
    tags            TEXT[]       DEFAULT '{}',
    status          story_status NOT NULL DEFAULT 'ongoing',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for story queries
CREATE INDEX idx_stories_author_id ON stories(author_id);
CREATE INDEX idx_stories_genre ON stories(genre);
CREATE INDEX idx_stories_status ON stories(status);
CREATE INDEX idx_stories_created_at ON stories(created_at DESC);

-- ============================================================
-- CHAPTERS TABLE
-- ============================================================

CREATE TABLE chapters (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id        UUID         NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    title           VARCHAR(200) NOT NULL,
    content         TEXT         DEFAULT '',
    chapter_order   INTEGER      NOT NULL DEFAULT 1,
    status          chapter_status NOT NULL DEFAULT 'draft',
    word_count      INTEGER      DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure chapter ordering is unique per story
    CONSTRAINT unique_chapter_order_per_story UNIQUE (story_id, chapter_order)
);

-- Indexes for chapter queries
CREATE INDEX idx_chapters_story_id ON chapters(story_id);
CREATE INDEX idx_chapters_status ON chapters(status);
CREATE INDEX idx_chapters_order ON chapters(story_id, chapter_order);

-- ============================================================
-- READING HISTORY TABLE
-- ============================================================

CREATE TABLE reading_history (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    story_id        UUID         NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    last_read_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT unique_user_story_history UNIQUE (user_id, story_id)
);

CREATE INDEX idx_reading_history_user ON reading_history(user_id);
CREATE INDEX idx_reading_history_last_read ON reading_history(last_read_at DESC);

-- ============================================================
-- FAVOURITES TABLE
-- ============================================================

CREATE TABLE favourites (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    story_id        UUID         NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT unique_user_story_favourite UNIQUE (user_id, story_id)
);

CREATE INDEX idx_favourites_user ON favourites(user_id);

-- ============================================================
-- STORY COMMENTS TABLE
-- ============================================================

CREATE TABLE story_comments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id        UUID         NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content         TEXT         NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_comments_story ON story_comments(story_id);
CREATE INDEX idx_comments_created ON story_comments(created_at DESC);

-- ============================================================
-- TRIGGER: Auto-update `updated_at` on row modification
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_stories_updated_at
    BEFORE UPDATE ON stories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_chapters_updated_at
    BEFORE UPDATE ON chapters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SEED DATA (Optional — for development/testing)
-- ============================================================

-- Example: Insert a test writer user (password: "password123" hashed with bcrypt)
-- INSERT INTO users (username, email, password_hash, role, display_name, bio)
-- VALUES (
--     'testwriter',
--     'writer@storyverse.com',
--     '$2b$10$example_hash_here',
--     'writer',
--     'Test Writer',
--     'A passionate storyteller exploring new worlds.'
-- );
