var config = {}

config.version = {};
config.version.service = 1.0;
config.version.api = 1.0;

config.db = {};
config.db.host = 'localhost';
config.db.port = 27017;
config.db.name = {};
config.db.name.release = 'project';
config.db.name.testing = 'test';

module.exports = config;