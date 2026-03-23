import path from 'path';
import { encryptedRead, encryptedWrite } from './encrypted-fs';

export type UserRole = 'siswa' | 'guru';

export interface User {
  id: string; // NISN or NIK/NUPTK
  name: string;
  role: UserRole;
  pin: string;
}

interface DatabaseSchema {
  users: User[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'users.json');

function readDb(): DatabaseSchema {
  return encryptedRead<DatabaseSchema>(DB_FILE, { users: [] });
}

function writeDb(data: DatabaseSchema) {
  encryptedWrite(DB_FILE, data);
}

export const db = {
  getUsers: () => readDb().users,
  
  getUserById: (id: string, role: UserRole) => {
    return readDb().users.find((u) => u.id === id && u.role === role);
  },

  addUser: (user: User) => {
    const data = readDb();
    if (data.users.some((u) => u.id === user.id && u.role === user.role)) {
      throw new Error(`User with ID ${user.id} and role ${user.role} already exists.`);
    }
    data.users.push(user);
    writeDb(data);
    return user;
  },

  deleteUser: (id: string, role: UserRole) => {
    const data = readDb();
    const initialLength = data.users.length;
    data.users = data.users.filter((u) => !(u.id === id && u.role === role));
    if (data.users.length !== initialLength) {
      writeDb(data);
      return true;
    }
    return false;
  },
};
