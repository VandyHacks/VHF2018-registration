const async = require('async');
const User = require('../models/User');

// In memory stats.
let stats = {};
function calculateStats() {
  console.log('Calculating stats...');
  const newStats = {
    lastUpdated: 0,

    total: 0,
    demo: {
      gender: {
        M: 0,
        F: 0,
        O: 0,
        N: 0
      },
      schools: {},
      year: {
        '2018': 0,
        '2019': 0,
        '2020': 0,
        '2021': 0,
        '2022': 0
      }
    },

    majors: {},

    teams: {},
    verified: 0,
    submitted: 0,
    admitted: 0,
    confirmed: 0,
    confirmedVandy: 0,
    declined: 0,

    confirmedFemale: 0,
    confirmedMale: 0,
    confirmedOther: 0,
    confirmedNone: 0,

    shirtSizes: {
      'XS': 0,
      'S': 0,
      'M': 0,
      'L': 0,
      'XL': 0,
      'XXL': 0,
      'WXS': 0,
      'WS': 0,
      'WM': 0,
      'WL': 0,
      'WXL': 0,
      'WXXL': 0,
      'None': 0
    },

    dietaryRestrictions: {},
    ethnicities: {},

    smsPermission: 0,
    lightningTalks: 0,

    volunteer: 0,
    volunteerSubmitted: 0,
    volunteerAdmitted: 0,
    volunteerConfirmed: 0,

    mentorSubmitted: 0,
    mentorAdmitted: 0,

    reimbursementTotal: 0,
    reimbursementMissing: 0,

    wantsHardware: 0
  };

  User
    .find({})
    .exec((err, users) => {
      if (err || !users) {
        throw err;
      }

      newStats.total = users.length;

      async.each(users, (user, callback) => {
        // vars
        const isConfirmed = user.status.confirmed;
        const gender = user.profile.gender;

        // Grab the email extension
        const email = user.email.split('@')[1];

        // Add to the gender
        newStats.demo.gender[gender] += 1;

        // Count verified
        newStats.verified += user.verified ? 1 : 0;

        // Count submitted
        newStats.submitted += user.status.completedProfile ? 1 : 0;

        // Count accepted
        newStats.admitted += user.status.admitted ? 1 : 0;

        // Count confirmed
        newStats.confirmed += isConfirmed ? 1 : 0;

        // Count confirmed that are vandy
        newStats.confirmedVandy += isConfirmed && email === 'vanderbilt.edu' ? 1 : 0;

        newStats.confirmedFemale += isConfirmed && gender === 'F' ? 1 : 0;
        newStats.confirmedMale += isConfirmed && gender === 'M' ? 1 : 0;
        newStats.confirmedOther += isConfirmed && gender === 'O' ? 1 : 0;
        newStats.confirmedNone += isConfirmed && gender === 'N' ? 1 : 0;

        // Count declined
        newStats.declined += user.status.declined ? 1 : 0;

        // Count sms permissions
        newStats.smsPermission += user.confirmation.smsPermission ? 1 : 0;

        // Count lightning talk volunteers
        newStats.lightningTalks += user.confirmation.lightningTalker ? 1 : 0;

        // Count the number of people who need reimbursements
        newStats.reimbursementTotal += user.confirmation.needsReimbursement ? 1 : 0;

        // Count the number of people who still need to be reimbursed
        newStats.reimbursementMissing += user.confirmation.needsReimbursement &&
          !user.status.reimbursementGiven ? 1 : 0;

        // Count the number of people who want hardware
        newStats.wantsHardware += user.confirmation.wantsHardware ? 1 : 0;

        if (user.profile.majors) {
          user.profile.majors.split(',').forEach(major => {
            major = String(major);
            if (!newStats.majors[major]) {
              newStats.majors[major] = 0;
            }
            newStats.majors[major] += 1;
          });
        }

        // Count schools
        if (!newStats.demo.schools[email]) {
          newStats.demo.schools[email] = {
            submitted: 0,
            admitted: 0,
            confirmed: 0,
            declined: 0
          };
        }
        newStats.demo.schools[email].submitted += user.status.completedProfile ? 1 : 0;
        newStats.demo.schools[email].admitted += user.status.admitted ? 1 : 0;
        newStats.demo.schools[email].confirmed += isConfirmed ? 1 : 0;
        newStats.demo.schools[email].declined += user.status.declined ? 1 : 0;

        // Count graduation years
        if (user.profile.graduationYear) {
          newStats.demo.year[user.profile.graduationYear] += 1;
        }

        // Grab the team name if there is one
        // if (user.teamCode && user.teamCode.length > 0){
        //   if (!newStats.teams[user.teamCode]){
        //     newStats.teams[user.teamCode] = [];
        //   }
        //   newStats.teams[user.teamCode].push(user.profile.name);
        // }

        // Count shirt sizes
        if (user.confirmation.shirtSize in newStats.shirtSizes) {
          newStats.shirtSizes[user.confirmation.shirtSize] += 1;
        }

        // Host needed counts
        if (user.profile.volunteer) {
          newStats.volunteer += 1;
          newStats.volunteerSubmitted += user.status.completedProfile ? 1 : 0;
          newStats.volunteerAdmitted += user.status.admitted ? 1 : 0;
          newStats.volunteerConfirmed += isConfirmed ? 1 : 0;
        }

        if (user.profile.mentor_applied) { newStats.mentorSubmitted += 1; }
        if (user.profile.mentor_accepted) { newStats.mentorAdmitted += 1; }

        // Dietary restrictions
        if (user.confirmation.dietaryRestrictions) {
          user.confirmation.dietaryRestrictions.forEach(e => {
            if (!newStats.dietaryRestrictions[e]) {
              newStats.dietaryRestrictions[e] = 0;
            }
            newStats.dietaryRestrictions[e] += 1;
          });
        }

        // Ethnicities
        if (user.profile.ethnicities) {
          user.profile.ethnicities.forEach(e => {
            if (!newStats.ethnicities[e]) {
              newStats.ethnicities[e] = 0;
            }
            newStats.ethnicities[e] += 1;
          });
        }

        callback(); // let async know we've finished
      }, () => {
        // Transform dietary restrictions into a series of objects
        const restrictions = [];
        Object.keys(newStats.dietaryRestrictions)
          .forEach((key) => {
            restrictions.push({
              name: key,
              count: newStats.dietaryRestrictions[key]
            });
          });
        newStats.dietaryRestrictions = restrictions;

        // Transform ethnicities into series of objects
        const ethnicities = [];
        Object.keys(newStats.ethnicities)
          .forEach((key) => {
            ethnicities.push({
              name: key,
              count: newStats.ethnicities[key]
            });
          });
        newStats.ethnicities = ethnicities;

        // Transform schools into an array of objects
        const schools = [];
        Object.keys(newStats.demo.schools)
          .forEach((key) => {
            schools.push({
              email: key,
              count: newStats.demo.schools[key].submitted,
              stats: newStats.demo.schools[key]
            });
          });
        newStats.demo.schools = schools;
        const TOP_SCHOOL_LIMIT = 10;
        newStats.demo.topSchools = schools.filter(s => s.stats.submitted >= TOP_SCHOOL_LIMIT);
        newStats.demo.nonTopSchools = schools.filter(s => s.stats.submitted < TOP_SCHOOL_LIMIT);

        // Likewise, transform the teams into an array of objects
        // var teams = [];
        // Object.keys(newStats.teams)
        //   .forEach(function(key){
        //     teams.push({
        //       name: key,
        //       users: newStats.teams[key]
        //     });
        //   });
        // newStats.teams = teams;

        console.log('Stats updated!');
        newStats.lastUpdated = new Date();
        stats = newStats;
      });
    });
}

// Calculate once every five minutes.
calculateStats();
setInterval(calculateStats, 5 * 60 * 1000);

const Stats = {};

Stats.getUserStats = function () {
  return stats;
};

module.exports = Stats;
