exports.up = knex => {
  return knex.schema.table('recordings', table => {
    table.enum('status', ['in_progress', 'finished', 'error']);
  });
};

exports.down = knex => {
  return knex.schema.table('recordings', table => {
    table.dropColumn('status');
  });
};
