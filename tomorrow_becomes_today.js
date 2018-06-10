require('dotenv').config()
var Evernote = require('evernote');
var without = require('lodash/without');

var zeroTodayGuid;
var oneTomorrowGuid;
var oneTomorrowString = '1-tomorrow';
var zeroTodayString = '0-today';

var client = new Evernote.Client({
  consumerKey: process.env.API_CONSUMER_KEY,
  consumerSecret: process.env.API_CONSUMER_SECRET,
  token: process.env.TOKEN,
  sandbox: false,
  china: false
});

var noteStore = client.getNoteStore();

var filter = new Evernote.NoteStore.NoteFilter({
  words: 'tag:' + oneTomorrowString,
  ascending: true
});

var spec = new Evernote.NoteStore.NotesMetadataResultSpec({
  includeTitle: true,
  includeTagGuids: true,
});

noteStore.listTags().then(function(tags) {
  tags.forEach(function(tag) {
    if (tag.name === zeroTodayString) {
      zeroTodayGuid = tag.guid
    } else if (tag.name === oneTomorrowString) {
      oneTomorrowGuid = tag.guid
    }
  })
}, function(error) {
  console.log(error);
});

noteStore.findNotesMetadata(filter, 0, 500, spec).then(function(tags) {
  tags.notes.forEach(function(note) {
    newTagGuids = without(note.tagGuids, oneTomorrowGuid);
    newTagGuids.push(zeroTodayGuid);
    noteStore.updateNote({
      guid: note.guid,
      title: note.title,
      tagGuids: newTagGuids
    }).then(function(data) {
      console.log('successfully updated');
    }, function(error) {
      console.log(error);
    })
  })
}, function(error) {
  console.log(error);
});
