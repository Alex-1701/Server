const { json } = require('body-parser')

const sqlite3 = require('../../node_modules/sqlite3').verbose()

function getJournal(status, id, option, value) {
  // Запрос к журналу может выполнять студент, тогда он получит журнал своей группы.
  // Или любой другой пользователь, тогда он должен указать группу.

  let db = openDB()
  var group
  if (status == "Student"){
    sql = `SELECT "group" FROM Student WHERE student_id = ${id}`
    
    db.get(sql, (err, row) => {
      if (err) {
        console.log("database error")
        console.log(err.message);
      }
      else{
        if(row){
          console.log(row)
          group = parseInt(row.group)
        }
        else{
          console.log('No students found');
        }
      }
    })
  }
  else {
    // Тут нужно подумать
  }
  

	
  
  console.log("lol")
	console.log(option)
  console.log(value)
  console.log(group)

	return "kek"
}

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

module.exports.getJournal = getJournal
