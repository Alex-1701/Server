const { json } = require('body-parser')

const sqlite3 = require('../../node_modules/sqlite3').verbose()

function getJournal(status, id, option, value) {
  // Запрос к журналу может выполнять студент, тогда он получит журнал своей группы.
  // Или любой другой пользователь, тогда он должен указать группу.

  let db = openDB()

  if (status == "Student"){
    //sql = `SELECT "group" FROM Student WHERE student_id = ${id}`
    sql =   `SELECT student_id, class_number, presence, discipline, teacher
            FROM JournalEntry
            WHERE student_id IN (
                SELECT student_id
                FROM Student
                WHERE ("group" IN (
                    SELECT "group"
                    FROM Student
                    WHERE student_id = ${id}
                    ) AND date = "${value}") 
            )`

    db.all(sql, (err, rows) => {
      if (err) {
        console.log("database error")
        console.log(err.message);
      }
      else{
        if(rows){
          //group = row.group
          console.log(rows)
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

  
  //console.log("lol")
	//console.log(option)
  //console.log(value)
  //console.log("this = " + group)

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
