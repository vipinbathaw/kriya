import db from '../config/database.js';
import knex from 'knex';

const k = knex(db);

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  display_name: string;
  avatar_url: string | null;
  email_verified: number;
  email_verify_token: string | null;
  created_at: string;
  updated_at: string;
}

export const userRepository = {
  async findById(id: string): Promise<UserRow | undefined> {
    return k('users').where({ id }).first();
  },

  async findByEmail(email: string): Promise<UserRow | undefined> {
    return k('users').where({ email }).first();
  },

  async create(data: {
    id: string;
    email: string;
    password_hash: string;
    display_name: string;
    email_verified: boolean;
    email_verify_token: string | null;
  }): Promise<void> {
    await k('users').insert(data);
  },

  async findByVerifyToken(token: string): Promise<UserRow | undefined> {
    return k('users').where({ email_verify_token: token }).first();
  },

  async verifyEmail(id: string): Promise<void> {
    await k('users').where({ id }).update({ email_verified: true, email_verify_token: null });
  },

  async update(id: string, data: Partial<Pick<UserRow, 'display_name' | 'avatar_url'>>): Promise<void> {
    await k('users').where({ id }).update(data);
  },
};
