exports.up = knex => {
  return knex.schema.table('users', t => {
    t.integer('credits')
      .notNull()
      .defaultTo(0);
  });
};

exports.down = knex => {
  return knex.schema.table('users', t => {
    t.dropColumn('credits');
  });
};
