exports.up = knex => {
  return knex.schema.table('recordings', table => {
    table.integer('userId').unsigned();
    table.foreign('userId').references('users.id');
    table.index('userId');
    table.index('name');
  });
};

exports.down = knex => {
  return knex.schema.table('recordings', table => {
    table.dropColumn('userId');
    table.dropForeign('userId');
    table.dropIndex('userId');
    table.dropIndex('name');
  });
};
