# COMP 3008 - Part 1.3

A Node.JS project which processes the log data from two password schemes from [this Password Scheme Demonstration](https://mvp.soft.carleton.ca/svp3008) from 2017.

Text21 Log file: `text21.csv`

Imagept21 Log file: `imagept21.csv`

## Instructions

You'll need [Node.js](https://nodejs.org/en/) to run this project. We used Node v13.8.0. We can't guarantee that the program will run the same way if you use a lesser version of Node.

You'll also need the [Yarn Package Manager](https://classic.yarnpkg.com/) for this project. **This project uses Yarn 1.0, specifically version 1.22.0.** Yarn 2.0 most likely won't work.

Once the repository is cloned, run the following commands within it:

- `yarn install`
- `node index.js`

You should see a new file, `output.csv`. This is the result of the program.

## Pseudocode

To process the two log files, we're only paying attention to two events: logging in successfully i.e. `"login,success"`, and logging in unsuccessfully i.e. `"login,failed"`. From those events, we need to gather

- The number of logins (successful, unsuccessful) per user
- The average time it took to login (successfully, unsuccessfully) per user

The first point is easier to do, since you just have to count how many times you see `"login,success"` and `"login,failed"` per user.

For the second point, we need to know when they began entering their password to know how long it took. To achieve this, we needed to know the time of the previous `"enter,start"` event. Once we encountered the events from the first point, we compared the time of the `"login,x"` event with the time of the previous `"enter,start"` event.

Once that data was collected, we output the findings in a csv where each row is all the data pertaining a single user.

```javascript
let users = {}

for both csv files {
  for row in file {
    if the event is "enter,start" {
      timeAtStart = currentTime
    } else if the event is "login, failed" {
      users[id].failedLogins++
      users[id].failedLoginTime += (timeAtStart - currentTime)
    } else if the event is "login, success" {
      users[id].successLogins++
      users[id].successLoginTime += (timeAtStart - currentTime)
    }
  }
}

// Then output the users object as a csv
```
