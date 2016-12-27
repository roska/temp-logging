/*
 * Data service layer
 *
 * The app shall communicate with api only through this service
 */
var request = require('request'); // TODO: npm install request!!!
var url = "comeupwithapiurl"; // TODO: get api url from config-file

// Api service object
var api = {
  /*
   * logTemp()
   *
   * Sends sensor temperature data to the api
   * ----------------------------------------
   */
  logTemp : function(temp, timestamp) {
    var data = {
      'temp': temp,
      'timestamp' : timestamp
    };

    // Make the request
    request.post('/temp', data, function (err, res, body) {
      if (!err && res.statusCode == 200) {
        console.log('api request succesful!');
        console.log(body);
      }
    });
  }
}

// Expose api
modules.export = api;
