exports.up = knex => {
  return knex.schema.createTable('recordings', table => {
    table.increments('id');
    table.string('name').notNullable();
    table.timestamp('timestamp').defaultTo(knex.fn.now());
    table.json('transcription');
  });
};

exports.down = knex => {
  return knex.schema.dropTable('recordings');
};
