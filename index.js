require('dotenv').config()
const request = require('superagent')
const { createWriteStream } = require('fs')

const URL = 'https://slack.com/api/search.messages'
const QUERY = '“The *Salesforce Service* added a location” in:#salesforce-to-karma after:2018-05-31'

const file = createWriteStream(`./${process.env.FILE_NAME}`);
file.write(`WHERE id IN (\n`);

const getMessage = async page => request
  .get(URL)
  .query({ token: process.env.SLACK_TOKEN })
  .query({ query: QUERY })
  .query({ page: page })
  .then(res => {
    const messages = res.body.messages
    const paging = messages.paging
    const matches = messages.matches
    const values = matches ? matches.map(match => {
      if (!match.attachments) {
        return null
      }
      return match.attachments.map(attachment => {
        const { fields } = attachment
        const { value } = fields[1]
        const { location, company, user } = JSON.parse(value)
        file.write(`\t${location},\n`);
      })
    }) : []

    console.log(`Returning results for page ${page}`)
    const hasMore = page < paging.pages
    if (hasMore) {
      return setTimeout(() => getMessage(page + 1), 3500)
    }
    console.log('ids', ids.length)
    file.write(`)`);
    file.end()
    return 'All finnished!'
  })
  .catch(error => {
    console.error(error)
    throw new Error(error.message)
  })

getMessage(1).then(res => {
  // console.log(results)
})
