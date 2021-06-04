//const sqlite3 = require('../../node_modules/sqlite3').verbose()
//const sqlite3 = require('../Server/node_modules/sqlite3').verbose()
//const sqlite3 = require('../app_7a6494a2-dba4-4d14-9015-79a8d41453d7/node_modules/sqlite3').verbose() // Server
//const sqlite3 = require('../app_e5cc70ae-bb85-4b52-a5ce-18603c0b921e/node_modules/sqlite3').verbose() // Server2
  const sqlite3 = require('../app_17647f6f-f098-412c-9bdc-3b33c482bbec/node_modules/sqlite3').verbose() // Server3

function getJournal(status, id, value, res) {
  // Запрос к журналу может выполнять студент, тогда он получит журнал своей группы.
  // Или любой другой пользователь, тогда он должен указать группу.
  let db = openDB()
  if (status == "Student"){
    sql = `SELECT full_name AS "имя", class_number AS "пара", presence AS "присутствие", short_name AS "предмет"
    FROM (JournalEntry INNER JOIN Discipline ON JournalEntry.discipline = Discipline.name) LEFT JOIN Student
    ON Student.student_id = JournalEntry.student_id
    WHERE JournalEntry.student_id IN (
        SELECT Student.student_id
        FROM Student
        WHERE ("group" IN (
            SELECT "group"
            FROM Student
            WHERE student_id = ${id}
            ) AND date = "${convertDate(value.date)}")
    )`
    db.all(sql, (err, rows) => {
      if (err) {
        console.log("database error")
        console.log(err.message);
        empty = {
          res: "empty"
        }
        res.send(empty)
      }
      else{
        if(rows) {
          // Проверка на наличие записей в объекте который вернула бд 
          // Если объект пустой, то посылаем ответ об этом         
          if (JSON.stringify(rows) === JSON.stringify([])) {
            console.log("rows is empty")
            empty = {
              res: "empty"
            }
            res.send(empty)  
          } else {
            console.log("returning rows...")
            result = {
              data: Array.from(rows),
              permissions: {
                mutable: false
              }
            }
            res.send(result)
          }
        }
        else{
          console.log('No students found');
          empty = {
            res: "empty"
          }
          res.send(empty) 
        }
      }
    })
  }
  else {
    // Если запрос отправляет учитель или Админ
    sql = `SELECT Student.student_id, full_name AS имя, class_number AS пара, presence AS присутствие, short_name AS предмет
    FROM (JournalEntry INNER JOIN Discipline ON JournalEntry.discipline = Discipline.name ) LEFT JOIN Student
    ON Student.student_id = JournalEntry.student_id
    WHERE JournalEntry.student_id IN ( SELECT Student.student_id FROM Student
    WHERE ("group" = ${value.group} AND  date = "${convertDate(value.date)}"))`
    
    db.all(sql, (err, rows) => {
      if(rows) {
        // Проверка на наличие записей в объекте который вернула бд 
        // Если объект пустой, то посылаем ответ об этом         
        if (JSON.stringify(rows) === JSON.stringify([])) {
          console.log("rows is empty")
          empty = {
            res: "empty"
          }
          res.send(empty)  
        } else {
          console.log("returning rows...")
          result = {
            data: Array.from(rows),
            permissions: {
              mutable: true
            }
          }
          res.send(result)
        }
      }
      else{
        console.log('No records found');
        empty = {
          res: "empty"
        }
        res.send(empty) 
      }
    })
  }
}
function changeTuple(status, value, res) {
  // Запрос к на изменеие может выполнять учитель или админ.
  console.log("changing Tuple")
  let db = openDB();
  if (status != "Student"){
    sql = `UPDATE JournalEntry
    SET presence = CASE WHEN presence == "-" THEN "+" ELSE "-" END
    WHERE date = "${convertDate(value.date)}" AND student_id = ${value.student_id} AND class_number = ${value.class_number};`
    db.run(sql, (err) => {
      if (err) {
        console.log("database error");
        console.log(err.message);
        unsuccess = {
          res: "unsuccess"
        }
        res.send(unsuccess);
      }
      else {
        success = {
          res: "success"
        }
        res.send(success);
      }
    })
  }
  else {
    unsuccess = {
      res: "unsuccess",
      message: "not enough rights"
    }
    res.send(unsuccess);
  }
}
function deleteTuple(status, value, res) {
  // Запрос к на изменеие может выполнять учитель или админ.
  console.log("deleting Tuple")
  let db = openDB();
  if (status != "Student"){
    sql = `DELETE FROM JournalEntry
    WHERE date = "${convertDate(value.date)}" AND student_id = ${value.student_id} AND class_number = ${value.class_number};`
    db.run(sql, (err) => {
      if (err) {
        console.log("database error");
        console.log(err.message);
        unsuccess = {
          res: "unsuccess"
        }
        res.send(unsuccess);
      }
      else {
        success = {
          res: "success"
        }
        res.send(success);
      }
    })
  }
  else {
    unsuccess = {
      res: "unsuccess",
      message: "not enough rights"
    }
    res.send(unsuccess);
  }
}
function getStatictic(status, value, res) {
  // Запрос на получение таблицы статистики.
  console.log("getting Statictic")
  let db = openDB();
  if (status == "Admin"){
    sql = `SELECT full_name AS "имя", presence
          FROM JournalEntry LEFT JOIN Student
          ON Student.student_id = JournalEntry.student_id
          WHERE JournalEntry.student_id IN (
            SELECT Student.student_id
            FROM Student
            WHERE ("group" = "${value.group}") 
          )
          ORDER BY full_name`
    db.all(sql, (err, rows) => {
      if (err) {
        console.log("database error");
        console.log(err.message);
        unsuccess = {
          res: "unsuccess"
        }
        res.send(unsuccess);
      }
      else {
        if (rows) {
          // Это такой объект
          students = new Set();
          for (i = 0; i < rows.length; i++) {
            // Клёвая штука. Автоматом выбирает уникальные значения.
            students.add(rows[i]["имя"]);
          }
          
          array = []
          myArray = Array.from(students);
          
          for (i = 0; i < myArray.length; i++) {
            var count = 0;
            for (j = 0; j < rows.length; j++) {
              if (rows[j]["имя"] == myArray[i] && rows[j].presence == '-')
                count++;
            }
            temp = {
              "имя": myArray[i], 
              "пропуски": count
            }
            array.push(temp);
          }
          
          result = {
            data: array,
            // Это описание, является ли таблица изменяемой. 
            // Тоесть нужно ли к ней кнопки рисовать.
            permissions: {
              mutable: false
            }
          }
          res.send(result); 
        }
      }
    })
  }
  else {
    result = {
      res: "error",
      message: "not enough rights"
    }
    res.send(result);
  }
}
function openDB() {
  let db = new sqlite3.Database('dataBase.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message)
      console.log(err.message)
    }
    console.log('open the database in parts.js')
  })
  return db
}
function convertDate(wrongDate) {
  temp = new Date(wrongDate)
  date = temp.getDate()
  if(date < 10)
    date = "0" + date
  month = temp.getMonth() + 1
  if (month < 10)
    month = "0" + month
  year = temp.getFullYear()
  fullDate = date + "." + month + "." + year
  return fullDate
}
module.exports.getJournal = getJournal
module.exports.changeTuple = changeTuple
module.exports.deleteTuple = deleteTuple
module.exports.getStatictic = getStatictic
