
var config = {
    database: {
        host:      'localhost',     // database host
        user:       'phpmyadmin',         // your database username
        password: 'App@12345',         // your database password
        port:       3306,         // default MySQL port
        db:       'kart'         // your database name
    },
    server: {
        host: '127.0.0.1',
        port: '3000'
    },

     //secret key for token
    secretkey : "heymynameistabish",

    
}



module.exports = config