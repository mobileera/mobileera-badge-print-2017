var XLSX = require('xlsx')
var _ = require('lodash')
var moment = require('moment')

var IMAGES = {
  'Attendee': 'images/badge-print.png',
  'Trainee': 'images/badge-print.png',
  'Speaker': 'images/badge-print2.png',
  'Organizer': 'images/badge-print3.png',
  'Sponsor': 'images/badge-print4.png'
}

var TRACKS = [
  "Odin", "Freyja", "Thor"
]

var DIET_STOP_LIST = [
  'meat, shrimps',
  'Food',
  'Steak, burgers or pizzas',
  'None, I&#39;m happy with anyting',
  'Nope',
  'nope',
  'sushi',
  'No preferences',
  'No.',
  'cheeseburger :)',
  'Meat! :o)',
  'Nope',
  'I love meat.',
  'I like food',
  'no, thanks',
  'No',
  'no',
  'Beef',
  'Steak, Burgers or pizzas.',
  'Chicken',
  'Roast beef',
  'None, I&#39;m happy with anyting',
  'Steak & Salad',
  'sushi',
  'No preferences',
  'NA',
  'Meet',
  'Meat',
  'Nope.',
  'I love meat.',
  'Sushi!',
  'banana',
  'Burger',
  'all its fine',
  'None',
  'none',
  'T',
  'no :)',
  'No restrictions'

]

var TSHIRTS = {
  'Female XS': 0,
  'Female S': 0,
  'Female M': 0,
  'Female L': 0,
  'Female XL': 0,
  'Female XXL': 0,
  'Male XS': 0,
  'Male S': 0,
  'Male M': 0,
  'Male L': 0,
  'Male XL': 0,
  'Male XXL': 0,
  '-': 0,
  'number': 0
}

var TICKET_TYPES = {
  'numberRegular': 0,
  'numberDiscounted': 0,
  'numberFree': 0,
  'total': 0,
  'number': 0
}

var STATS = {
  'conf': {
    'tickets': {
      'blindBird': Object.assign({}, TICKET_TYPES),
      'earlyBird': Object.assign({}, TICKET_TYPES),
      'lateBird': Object.assign({}, TICKET_TYPES),
      'studentPass': Object.assign({}, TICKET_TYPES),
      'total': 0,
      'number': 0
    },
    'people': {
      'attendees': 0,
      'organizers': 0,
      'speakers': 0,
      'sponsors': 0,
      'number': 0
    },
    'diet': {
      'list': [],
      'number': 0
    },
    'referrer': {
      "I'm Mobile Era 2016 participant": 0,
      'Twitter': 0,
      'Facebook': 0,
      'Meetup': 0,
      'Search engine': 0,
      'Printed ad': 0,
      'Article or blog post': 0,
      'Friend': 0
    }
  },
  'workshops': {
    'tickets': {
      'WORKSHOP: Kotlin for Java developers': {
        'total': 0,
        'number': 0
      },
      'WORKSHOP: Building Cross Platform Native Mobile Apps using React Native': {
        'total': 0,
        'number': 0
      },
      'WORKSHOP: Reactive Programming with RxSwift': {
        'total': 0,
        'number': 0
      },
      'WORKSHOP: Continuous Deployment: Automate your app release process with fastlane': {
        'total': 0,
        'number': 0
      },
      'total': 0,
      'number': 0
    },
    'people': {
      'attendees': 0,
      'organizers': 0,
      'speakers': 0,
      'sponsors': 0,
      'number': 0
    },
    'diet': {
      'list': [],
      'number': 0
    }
  },
  'tshirts': {
    'attendees': Object.assign({}, TSHIRTS),
    'organizers': Object.assign({}, TSHIRTS),
    'speakers': Object.assign({}, TSHIRTS),
    'sponsors': Object.assign({}, TSHIRTS),
    'black': Object.assign({}, TSHIRTS),
    'white': Object.assign({}, TSHIRTS),
    'number': 0
  },
  'total': 0,
  'filteredByDate': 0
}

function createParticipant (participant, programData) {
  var firstName = participant['Ticket First Name'] || ''
  var lastName = participant['Ticket Last Name'] || ''

  if (firstName.trim() && lastName.trim()) {
    var fullName = [firstName.trim(), lastName.trim()].join(' ')
  }else {
    console.log('Unassigned ticket for ticket ' + participant['Ticket Reference'] + ' . Using order name')
    var fullName = participant['Order Name']
  }

  var company = participant['Ticket Company Name']
  var sessionInfo = null

  var ticketName = participant['Ticket']

  var ticketPrice = parseInt(participant['Price'])

  var categoryName = null

  var tShirt = participant['T-shirt type & size']

  var dietAnswer = participant['Do you have any dietary restrictions?'].trim()

  var diet = (dietAnswer === '-' || _.includes(DIET_STOP_LIST, dietAnswer)) ? null : dietAnswer

  var discount = participant['Order Discount Code'] !== '-' ? participant['Order Discount Code'] : null
  var referrer = participant['How did you hear about us?'] !== '-' ? participant['How did you hear about us?'] : null

  var email = participant['Ticket Email']

  var contactCard = fullName + ' <' + email + '>'

  var modifiedDate = moment(participant['Ticket Last Updated Date'], 'MM/DD/YY'); // Last Updated | Created

  var twitter = participant['Twitter handle to print on your badge'] !== '-' ? '@' + _.trimStart(participant['Twitter handle to print on your badge'], '@') : null

  if (company) {
    contactCard += ' of ' + company
  }

  if (ticketName.includes('Bird') || ticketName.includes('Student') || ticketName.includes('Discounted')) {
    categoryName = 'Attendee'

    var confType = _.camelCase(ticketName)

    if (confType == 'sponsorBlindBirdInvoiced') {
      confType = 'blindBird'
      discount = 'sponsorBlindBirdInvoiced'
    }

    if (confType == 'speakerDiscountedTicket') {
      confType = 'blindBird'
      discount = 'speakerDiscountedTicket'
    }

    STATS.conf.tickets.number++
    STATS.conf.tickets.total += ticketPrice

    STATS.conf.people.attendees++
    STATS.conf.people.number++

    STATS.total += ticketPrice

    if (ticketPrice === 0) {
      STATS.conf.tickets[confType].numberFree++
      STATS.conf.tickets[confType].number++

    // console.log('Free ticket with code/tag: ' +  ( discount ? discount : '' ) + ( participant['Tags'] ? participant['Tags'] : '' )  + ' ref: ' + participant['Ticket Reference'] + ' company: ' + participant['Ticket Company Name'])
    } else if (!discount) {
      STATS.conf.tickets[confType].numberRegular++
      STATS.conf.tickets[confType].number++
      STATS.conf.tickets[confType].total += ticketPrice
    } else {
      STATS.conf.tickets[confType].numberDiscounted++
      STATS.conf.tickets[confType].number++
      STATS.conf.tickets[confType].total += ticketPrice

      // console.log('Discounted ticket with code: ' + participant['Order Discount Code'] + ' and price ' + ticketPrice + ' ref: ' + participant['Ticket Reference'])

    }

    STATS.tshirts.attendees[tShirt]++
    STATS.tshirts.attendees.number++
    STATS.tshirts.number++

    STATS.tshirts.black[tShirt]++
    STATS.tshirts.black.number++

    if (diet) {
      STATS.conf.diet.list.push(diet)
      STATS.conf.diet.number++
    }

    if (referrer && (STATS.conf.referrer[referrer] === 0 || STATS.conf.referrer[referrer] > 0)) {
      STATS.conf.referrer[referrer]++
    }
  } else if (ticketName.includes('WORKSHOP')) {
    categoryName = 'Trainee'

    STATS.workshops.tickets.number++
    STATS.workshops.tickets.total += ticketPrice

    STATS.workshops.people.attendees++
    STATS.workshops.people.number++

    STATS.total += ticketPrice

    STATS.workshops.tickets[ticketName].number++
    STATS.workshops.tickets[ticketName].total += ticketPrice

    if (diet) {
      STATS.workshops.diet.list.push(diet)
      STATS.workshops.diet.number++
    }
  } else if (ticketName === 'Crew ticket') {
    categoryName = participant['Crew type']

    STATS.conf.people.organizers++

    STATS.conf.people.number++

    STATS.tshirts.organizers[tShirt]++
    STATS.tshirts.organizers.number++
    STATS.tshirts.number++

    STATS.tshirts.white[tShirt]++
    STATS.tshirts.white.number++

    if (diet) {
      STATS.conf.diet.list.push(diet)
      STATS.conf.diet.number++
    }
  } else if (ticketName === 'Speaker Ticket') {
    categoryName = 'Speaker'
    sessionInfo = {}

    var speaker = programData.speakers.find(speaker => speaker.name == fullName
    )
    if (!speaker) {
      console.log("Can't find session for ", fullName)
    } else {
      sessionInfo.social = speaker.socials
      var session = Object.values(programData.sessions).find(session => session.speakers.includes(speaker.id)
      )
      if (!session) {
        console.log("Can't find session for ", fullName)
      } else {
        sessionInfo.title = session.title
        var timeslot = null
        for (const day of programData.schedule) {
          timeslot = day.timeslots.find(timeslot => [].concat.apply([], timeslot.sessions).includes(session.id))
          if (timeslot) {  
            sessionInfo.date = moment(day.date, 'YYYY-MM-DD').format('MMMM Do');
            sessionInfo.startTime = timeslot.startTime
            let flatSlots = timeslot.sessions.map(timeslot => {return timeslot[0]})
            sessionInfo.track = TRACKS[flatSlots.indexOf(session.id)]
            break;
          }
        }
        if (!timeslot) {
          console.log("Can't find timeslot for ", session.id, fullName, sessionInfo.title)
        }
      }
    }

    STATS.conf.people.speakers++

    STATS.conf.people.number++

    STATS.tshirts.speakers[tShirt]++
    STATS.tshirts.speakers.number++
    STATS.tshirts.number++

    STATS.tshirts.black[tShirt]++
    STATS.tshirts.black.number++

    if (diet) {
      STATS.conf.diet.list.push(diet)
      STATS.conf.diet.number++
    }
  } else if (ticketName.includes('Sponsor')) {
    categoryName = 'Sponsor'

    STATS.conf.people.sponsors++

    STATS.conf.people.number++

    STATS.tshirts.sponsors[tShirt]++
    STATS.tshirts.sponsors.number++
    STATS.tshirts.number++

    STATS.tshirts.black[tShirt]++
    STATS.tshirts.black.number++

    if (diet) {
      STATS.conf.diet.list.push(diet)
      STATS.conf.diet.number++
    }
  } else {
    console.log('===== Unknown category for ticket ' + participant['Ticket'])
  }

  var image = IMAGES[categoryName]

  return {
    fullName,
    company,
    contactCard,
    sessionInfo,
    image,
    categoryName,
    ticketName,
    modifiedDate,
  twitter}
}

function participants (filename, filterOnType, startingDate, programData) {
  var workbook = XLSX.readFile(filename)
  var worksheet = workbook.Sheets[workbook.SheetNames[0]]
  var participantsRaw = XLSX.utils.sheet_to_json(worksheet)
  var participantsProcessed = participantsRaw.map(function (participant) {
    return createParticipant(participant, programData)
  }).filter(function (p) {
    return p.categoryName
  }).filter(function (p) {
    return !filterOnType || filterOnType === p.categoryName
  }).filter(function (p) {
    if (startingDate) {
      if (p.modifiedDate.isSameOrAfter(startingDate)) {
        console.log('Modified date: ' + p.modifiedDate.format())
        STATS.filteredByDate++
        return true
      } else {
        return true // hack
      }
    } else {
      return true
    }
  }).sort(function (a, b) {
    if (a.categoryName.localeCompare(b.categoryName) != 0) {
      return a.categoryName.localeCompare(b.categoryName)
    }
    return a.fullName.localeCompare(b.fullName)
  })

  // console.log(JSON.stringify(STATS, undefined, 2))

  return participantsProcessed
}

module.exports = participants
