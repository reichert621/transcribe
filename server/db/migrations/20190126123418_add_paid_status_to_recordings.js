exports.up = knex => {
  return knex.schema.table('recordings', t => {
    t.boolean('paid')
      .notNull()
      .defaultTo(false);
  });
};

exports.down = knex => {
  return knex.schema.table('recordings', t => {
    t.dropColumn('paid');
  });
};
