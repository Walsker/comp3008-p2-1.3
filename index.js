/*
 * Created by Wal Wal
 * 11/02/2020
 * Description: A script that parses log files from two password testing schemes. See README.md.
 */
const csv = require('csv-parser')
const fs = require('fs')

/**
 * A method that calculates the time in seconds between two dates.
 * @param {string|number} dateString1 A date string | Milliseconds since epoch.
 * @param {string|number} dateString2 A second date string | Milliseconds since epoch.
 * @returns {number} The number of seconds between the two dates.
 */
const subtractTime = (dateString1, dateString2) => Math.abs((new Date(dateString1) - new Date(dateString2)) / 1000)

/**
 * A factory for creating a new user.
 * @param {string} id The ID of the user.
 * @param {string} scheme The password scheme.
 * @returns {Object} A user object with no added values.
 */
const newUser = (id, scheme) => {
  return {
    user: id,
    scheme,
    logins: {
      successful: 0,
      totalSuccessTime: 0,
      get avgSuccessTime() {
        return this.successful === 0 ? 0 : this.totalSuccessTime / this.successful
      },
      failed: 0,
      totalFailedTime: 0,
      get avgFailedTime() {
        return this.failed === 0 ? 0 : this.totalFailedTime / this.failed
      }
    }
  }
}

/**
 * A method that reads a csv file to a stream
 * @param {string} fileName The name of the .csv file to read.
 * @returns {Promise<Object[]>} Resolves once the .csv is read into an array containing each row as an object.
 */
const readCsv = fileName => {
  return new Promise((resolve, reject) => {
    const output = []
    try {
      // Read the file as a stream
      fs.createReadStream(fileName)
        .pipe(csv())
        .on('data', data => output.push(data))
        .on('end', () => {
          console.log(`Finished reading '${fileName}'.`)
          resolve(output)
        })
    } catch (error) {
      console.error(`Uh oh! Couldn\'t read '${fileName}'. Error: `, error)
      reject()
    }
  })
}

Promise.all([readCsv('text21.csv'), readCsv('imagept21.csv')]).then(([textCsv, imageCsv]) => {
  const users = {}
  let startTime = ''

  /**
   * A function which gathers the needed information from a row from the csv
   * @param {Object} param
   * @param {string} param.time The time which the action ocurred.
   * @param {string} param.user The User's ID.
   * @param {string} param.scheme The password scheme being tested.
   * @param {string} param.event The event identifier.
   * @param {string} param.data1 The first piece of data related to the event.
   */
  const processRow = ({ time, user, scheme, event, data1 }) => {
    // Check if the user has been seen before
    if (!users[user]) {
      // Create a new entry for this user
      users[user] = newUser(user, scheme === 'testtextrandom' ? 'Text21' : 'Image21')
    }

    // Check if the user has pressed the "Enter" button
    if (event === 'enter' && data1 === 'start') {
      // Mark down the time which they started
      startTime = time

      // Check if the user made a login attempt
    } else if (event === 'login') {
      if (data1 === 'failure') {
        users[user].logins.failed++
        users[user].logins.totalFailedTime += subtractTime(startTime, time)
      } else {
        users[user].logins.successful++
        users[user].logins.totalSuccessTime += subtractTime(startTime, time)
      }
      startTime = time
    }
  }

  // Apply the `processRow()` function to each element in both arrays
  textCsv.forEach(processRow)
  imageCsv.forEach(processRow)

  // Set the first line of the output file
  let output =
    'user,scheme,total logins,successful logins,unsuccessful logins,avg login time success (seconds),avg login time failed\n'

  // Add the collected stats of each user to the output
  Object.keys(users).forEach(
    id =>
      (output += `${id},${users[id].scheme},${users[id].logins.successful + users[id].logins.failed},${
        users[id].logins.successful
      },${users[id].logins.failed},${users[id].logins.avgSuccessTime},${users[id].logins.avgFailedTime}\n`)
  )

  // Write the output file
  fs.writeFile('output.csv', output, error => {
    if (error) {
      console.error('Write failed. Error: ', error)
    }
    console.log('Processing complete!')
  })
})
