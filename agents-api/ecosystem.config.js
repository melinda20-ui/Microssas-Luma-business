module.exports = {
  apps: [
    {
      name: 'microsaas-agents-api',
      script: 'server.js',
      cwd: '/var/www/microsaas/agents-api',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/var/log/pm2/agents-api-error.log',
      out_file: '/var/log/pm2/agents-api-out.log'
    },
    {
      name: 'microsaas-nextjs',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/var/www/microsaas',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '768M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/var/log/pm2/nextjs-error.log',
      out_file: '/var/log/pm2/nextjs-out.log'
    }
  ]
};
