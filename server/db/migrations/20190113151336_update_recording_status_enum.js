exports.up = knex => {
  return knex.schema
    .table('recordings', table => {
      table.dropColumn('status');
    })
    .then(() => {
      return knex.schema.table('recordings', table => {
        table.enum('status', ['IN_PROGRESS', 'FAILED', 'COMPLETED']);
      });
    });
};

exports.down = knex => {
  return knex.schema.table('recordings', table => {
    table.dropColumn('status');
  });
};
