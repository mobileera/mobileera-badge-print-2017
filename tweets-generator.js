
var fs = require('fs');
var _ = require('lodash');
var speakers = JSON.parse(fs.readFileSync('speakers.json', 'utf8'));
var sessions = JSON.parse(fs.readFileSync('sessions.json', 'utf8'));
var i = 0

_.map(sessions, session => {
  if(session.id>10 && session.id<80){
    i++
    title = session.title
    video = session.materials.video
    speaker = speakers[session.speakers[0]].name
    twitterObj = _.filter(speakers[session.speakers[0]].socials, social => {
      return social.name === 'Twitter'
    })
    if (twitterObj[0]) {
      twitter = twitterObj[0].link.substring(20)
    }
    console.log(i)
    console.log('Check the video of "' + title + '" session by ' + speaker + ( twitter ? ' @' + twitter : '' ) + ' at @ngVikingsConf ' + video)
  }
})
