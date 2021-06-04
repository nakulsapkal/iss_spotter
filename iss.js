/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */

const request = require('request');
const fetchMyIP = function(callback) {
  // use request to fetch IP address from JSON API
  request('https://api.ipify.org/?format=json', (error, response, body) => {

    if (error) {
      callback(error, null);
    } else if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
    } else {
      callback(null, JSON.parse(body).ip);
    }

  });

};


const fetchCoordsByIP = function(ip, callback) {

  request(`https://freegeoip.app/json/${ip}`, (error, response, body) => {

    if (error) {
      callback(error, null);
    } else if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
    } else {
      let data = {};
      data.longitude = JSON.parse(body).longitude;
      data.latitude = JSON.parse(body).latitude;

      callback(null, data);
    }
  });

};


/**
 * Makes a single API request to retrieve upcoming ISS fly over times the for the given lat/lng coordinates.
 * Input:
 *   - An object with keys `latitude` and `longitude`
 *   - A callback (to pass back an error or the array of resulting data)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly over times as an array of objects (null if error). Example:
 *     [ { risetime: 134564234, duration: 600 }, ... ]
 */
const fetchISSFlyOverTimes = function(coords, callback) {


  request(`http://api.open-notify.org/iss-pass.json?lat=${coords.latitude}&lon=${coords.longitude}`, (error, response, body) => {

    if (error) {
      callback(error, null);
    } else if (response === []) {
      callback('Empty', null);
    } else if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching coordinates. Response: ${body}`;
      callback(Error(msg), null);
    } else {
      const flyZones = JSON.parse(body);
      callback(null, flyZones.response);
    }
  });

}



// iss.js 

/**
 * Orchestrates multiple API requests in order to determine the next 5 upcoming ISS fly overs for the user's current location.
 * Input:
 *   - A callback with an error or results. 
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly-over times as an array (null if error):
 *     [ { risetime: <number>, duration: <number> }, ... ]
 */
const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }

    fetchCoordsByIP(ip, (error, loc) => {
      if (error) {
        return callback(error, null);
      }

      fetchISSFlyOverTimes(loc, (error, nextPasses) => {
        if (error) {
          return callback(error, null);
        }

        callback(null, nextPasses);
      });
    });
  });
};




// module.exports = { fetchMyIP, fetchCoordsByIP, fetchISSFlyOverTimes, nextISSTimesForMyLocation };
module.exports = { nextISSTimesForMyLocation };


// const request = require('request');
// const nextISSTimesForMyLocation = function(callback) {

//     // empty for now

//     request(`https://api.ipify.org/?format=json`, (error, response, body) => {

//       if (error) {
//         console.error(error);
//       } else if (response.statusCode !== 200) {
//         const msg = `Status Code ${response.statusCode} when fetching coordinates. Response: ${body}`;
//         callback(Error(msg), null);
//       } else {
//         request(`https://freegeoip.app/json/${JSON.parse(body).ip}`, (error, response, body) => {

//           if (error) {
//             callback(error, null);
//           } else if (response.statusCode !== 200) {
//             const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
//             callback(Error(msg), null);
//           } else {

//             request(`http://api.open-notify.org/iss-pass.json?lat=${JSON.parse(body).latitude}&lon=${JSON.parse(body).longitude}`, (error, response, body) => {

//               if (error) {
//                 callback(error, null);
//               } else if (response === []) {
//                 callback('Empty', null);
//               } else if (response.statusCode !== 200) {
//                 const msg = `Status Code ${response.statusCode} when fetching coordinates. Response: ${body}`;
//                 callback(Error(msg), null);
//               } else {
//                 const issFlyDetails = JSON.parse(body);
//                 callback(null, issFlyDetails);
//               }
//             });
//           }
//         });
//       }
//     })
//   }
//   // module.exports = { fetchMyIP, fetchCoordsByIP, fetchISSFlyOverTimes, nextISSTimesForMyLocation };
// module.exports = { nextISSTimesForMyLocation };