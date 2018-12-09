var mysqlModel = require('mysql-model');
var MyAppModel = mysqlModel.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'alpha-trade',
  });

  var modelUsers = MyAppModel.extend({
      tableName : "users"
  })

module.exports = {
    users: modelUsers
}