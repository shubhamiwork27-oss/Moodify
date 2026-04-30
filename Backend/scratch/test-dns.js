const dns = require('dns');
dns.setServers(['8.8.8.8']);
dns.resolveSrv('_mongodb._tcp.cluster1.lfupbfh.mongodb.net', (err, addresses) => {
  if (err) {
    console.error('Error resolving:', err);
  } else {
    console.log('Resolved addresses:', addresses);
  }
});
