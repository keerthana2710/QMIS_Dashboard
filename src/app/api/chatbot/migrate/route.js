import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// One-time migration endpoint to create chatbot tables
// DELETE this file after running it once
export async function POST() {
  try {
    // Try to create tables using raw SQL via Supabase's rpc
    // First, test if tables already exist by trying a query
    const { error: usersCheck } = await supabase
      .from('chatbot_users')
      .select('id')
      .limit(1);

    if (!usersCheck || usersCheck.code !== '42P01') {
      // Table exists or different error
      const { error: msgsCheck } = await supabase
        .from('chatbot_messages')
        .select('id')
        .limit(1);

      if (!msgsCheck || msgsCheck.code !== '42P01') {
        return NextResponse.json({
          success: true,
          message: 'Tables already exist',
        });
      }
    }

    return NextResponse.json({
      success: false,
      message: 'Tables do not exist yet. Please create them in the Supabase SQL Editor.',
      sql: `
-- Create chatbot_users table
CREATE TABLE IF NOT EXISTS chatbot_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'website-chatbot',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chatbot_messages table
CREATE TABLE IF NOT EXISTS chatbot_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  response TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_phone ON chatbot_messages(phone);
CREATE INDEX IF NOT EXISTS idx_chatbot_users_phone ON chatbot_users(phone);
      `,
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: error.message },
      { status: 500 }
    );
  }
}
