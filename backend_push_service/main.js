const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const app = express()
const fs = require("fs")
const webpush = require("web-push")



const VAPID_KEYS = {
  publicKey: 'BD6swrkl62_5QxOotuAnyJAvhNPYjmz57FNUvyX_Z79UM8govtGJFCtD-HonDgeMBjOTQg1dZoHACXvQgKj92Vs',
  privateKey: ''
}
app.use(cors())
app.use(bodyParser.json())

const PORT = 4500;
const DUMMY_DB_FILE_PATH = './saved_subscription_dummy_db.json'

const getSubscriptionAndSendNotificationFromDummyDb = async (notifyMsgObj) => {

  fs.readFile(DUMMY_DB_FILE_PATH, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return false;
    }
    console.log(data)
    const subObj = JSON.parse(data)
    console.log('SubObj: ', typeof subObj)
    sendNotification(subObj, Object.keys(notifyMsgObj).length > 0 ? notifyMsgObj : undefined)
    return data;
  })

}


// configuring webpush before sending notification
webpush.setVapidDetails('mailto:mmaneesanasingh@covalience.com', VAPID_KEYS.publicKey, VAPID_KEYS.privateKey)

function sendNotification(subscription, notificationMessageObj = {
  title: 'Payment Notification',
  message: 'Your payment of amount Rs. 100 has been successfully processed'
}) {
  const NOTIFY_JSON_STR = JSON.stringify(notificationMessageObj)
  console.log('Subcription type check', typeof subscription)
  webpush.sendNotification(subscription, NOTIFY_JSON_STR)
}


const saveSubscriptionToDummyDB = async (subscription) => {
  try {

    const fileContent = JSON.stringify(subscription)
    fs.writeFile(DUMMY_DB_FILE_PATH, fileContent, err => {
      if (err) {
        console.error(err)
      } else {
        console.log('Subcription saved successfully')
      }
    })

    return true
  } catch (err) {
    return false
  }

}

app.get("/", (req, res) => {
  res.send('Test')
  saveSubscriptionToDummyDB()
})

app.post('/save-subscription', async (req, res) => {
  const subscription = req.body;
  const result = await saveSubscriptionToDummyDB(subscription)

  if (result) {

    res.statusCode = 200

    res.json({ status: 'success', message: 'Subscription saved sucessfully' })
  } else {
    res.statusCode = 400
    res.json({ status: 'error' })
  }

})

app.post('/send-notification', async (req, res) => {
  let notificationObj = {}

  if (typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    notificationObj = req.body;
  }

  const subscription = await getSubscriptionAndSendNotificationFromDummyDb(notificationObj)
  res.json({ message: 'Successfully pushed the message' })
})


app.listen(PORT, () => {
  console.log(`Backend sever started listening on port: ${PORT}!`)
})










function main() {
  console.log('Push Service API main function log');
}


main()
