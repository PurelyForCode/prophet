import knexBuilder from "knex";

export const knexInstance = knexBuilder({
  client: "pg",
  connection: {
    host: "localhost",
    database: "prophet_db",
    user: "app_user",
    password: "password",
    port: 5432,
    pool: {
      min: 2,
      max: 10,
    },
  },
});
