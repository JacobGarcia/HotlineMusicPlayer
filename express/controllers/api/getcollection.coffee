_ = require('underscore')
User = require('../../models')('user')
albums = require('../../models/albums')
songs = require('../../models/songs')
artist = require('../../models/artist')
onealbum = require('../../models/album')

bogusUser = {
  name: "John Do",
  email: "john@example.com",
  city: "Boise",
  state: "Idaho",
  country: "USA",
  id: "BOGUS_ID"
}

module.exports = {
  update: (req, res) ->
    if req.params.id == "BOGUS_ID"
      bogusUser = _.clone(req.body.user)
      console.log(bogusUser)
      res.json()
    else if !(req.body.user?.id?)
      res.json(406, {error: "Malformed request. User data with id is missing from request."})
    else
      res.json(403, {error:"Permission Denied"})

    #User.findOne({_id: req.params.id}).exec((err, user) ->
    #  console.log("id passed: " + req.params.id)
    #  console.log("user: ")
    #  console.log(user)
    #  res.json({})
    #)

  show: (req, res) ->
    id = req.params.id
    User.findById(id, (err, user) ->
      res.json(user[0])
    )

  currentUser: (req, res) ->
    res.json(bogusUser)

  get: (req, res, next) ->
    console.log 'The results are '
    albums.get (result) ->
      res.json(result.rows)

  getsongs: (req, res, next) ->
    album = req.params.album_id
    songs.get album, (result) ->
      res.json(result.rows)

  getartist: (req, res, next) ->
    artist_id = req.params.artist_id
    artist.get artist_id, (result) ->
      res.json(result.rows)

  getalbum: (req, res, next) ->
    album_id = req.params.album_id
    onealbum.get album_id, (result) ->
      res.json(result.rows)

    #User.findOne({role: 'dummyUser'}, (err, user) ->
    #  if user
    #    res.json(user)
    #  else if !err?
    #    console.log("creating dummyuser")
    #    User.create({role: 'dummyUser'})
    #        .then((err, user) ->
    #          res.json(user)
    #        )
    #)

  password: (req, res) ->
    if req.params.id != "BOGUS_ID"
      res.json(403, {error: "Permission Denied"})

    passwordForm = req.body.password
    if passwordForm?
      if passwordForm.password == passwordForm.confirmation
        res.json()
      else
        res.json(406, { msg:"Passwords mismatched"})
    else
      res.json(406, { msg:"password data not sent correctly"})




}
