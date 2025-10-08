import { defineDb, defineTable, column } from 'astro:db';

const Argon2Cache = defineTable({
  columns: {
    // 复合主键：collection:postId
    key: column.text({ primaryKey: true }),
    password: column.text(),
    nonce: column.text(),
    tag: column.text(),
    salt: column.text(),
    derivedKey: column.text(),
  },
});

export default defineDb({
  tables: { Argon2Cache },
});
