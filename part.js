const sqlite3 = require('../../node_modules/sqlite3').verbose()

function getJournal(status, id, option, value) {
  db = openDB()
	console.log("lol")
	console.log(option)
  console.log(value)
  
	return "kek"
}

module.exports.getJournal = getJournal


function openDB() {
  let db = new sqlite3.Database('dataBase.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message)
      console.log(err.message)
    }
    console.log('open the database.')
  })
  return db
}