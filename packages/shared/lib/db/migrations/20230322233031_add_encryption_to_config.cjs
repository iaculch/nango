exports.up = async function (knex, _) {
    return knex.schema.withSchema('nango').alterTable('_nango_configs', function (table) {
        table.string('oauth_client_secret_iv');
        table.string('oauth_client_secret_tag');
    });
};

exports.down = function (knex, _) {
    return knex.schema.withSchema('nango').alterTable('_nango_configs', function (table) {
        table.dropColumn('oauth_client_secret_iv');
        table.dropColumn('oauth_client_secret_tag');
    });
};
