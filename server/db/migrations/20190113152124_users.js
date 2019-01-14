exports.up = knex => {
  return knex.schema.createTable('users', table => {
    table.increments('id');
    table.string('email').notNullable();
    table.string('password').notNullable();
    table.string('salt').notNullable();
  });
};

exports.down = knex => {
  return knex.schema.dropTable('users');
};
