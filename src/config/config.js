
if (process.env.ENVIRONMENT === 'development') {
	process.env.token_life = 43200000000;
} else process.env.token_life = 43200000;

const redisConf = {
	host: 'explorer_redis',
	database: 'explorer_redis',
	port: 8600,
};

module.exports = { redisConf }
