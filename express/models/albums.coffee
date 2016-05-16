user = 'JONSNOW'
host = '192.168.0.103:1521/XE'
password = 'ygritte'
oracledb = require('oracledb')
module.exports = {
  #Database Connection
  getConnection: getConnection = (callback) ->
    console.log 'Getting connection...'
    oracledb.getConnection {
      user: user
      password: password
      connectString: host
    }, (err, connection) ->
      if err
        console.error err.message
        return
      if connection
        console.log 'Success'
        callback connection
      return
    return

  doRelease: doRelease = (connection) ->
    connection.release (err) ->
      if err
        console.error err.message
      return
    return
    
  get: (callback) ->
    getConnection (connection) ->
      connection.execute 'SELECT al.id ID, al.name ALBUM, ar.name ARTIST ' + 'FROM ALBUM al, ARTIST ar, PARTICIPATE p ' + 'WHERE p.album_id = al.id ' + 'AND p.artist_id = ar.id', [], (err, result) ->
        if err
          console.error err.message
          doRelease connection
          return
        console.log result.metaData
        console.log result.rows
        doRelease connection
        callback result
        return
}
