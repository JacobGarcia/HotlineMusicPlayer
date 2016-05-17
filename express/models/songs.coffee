user = 'JONSNOW'
host = '192.168.0.103:1521/XE'
password = 'ygritte'
oracledb = require('oracledb')
module.exports = {
  #Database Connection
  getConnection: getConnection = (callback) ->
    console.log 'Getting connection...'
    oracledb.outFormat = oracledb.OBJECT
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

  get: (album, callback) ->
    console.log 'The album ID is ' + album
    getConnection (connection) ->
      connection.execute 'SELECT ALL S.ID ID, S.NAME SONG, A.NAME ALBUM, S.TRACK TRACK FROM BELONG B, SONG S, ALBUM A WHERE B.SONG_ID = S.ID AND B.ALBUM_ID = A.ID AND A.ID =' + album, [], (err, result) ->
        if err
          console.error err.message
          doRelease connection
          return
        console.log result.rows
        doRelease connection
        callback result
        return
}
