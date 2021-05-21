//#region Modules
const express = require('express')
const app = express()
const port = 3000
const sqlite3 = require('../../node_modules/sqlite3').verbose()
var bodyParser = require('body-parser')

app.use(bodyParser.json()) // for parsing application/json

// для передачи статических файлов
app.use(express.static('public'))
app.use('/static', express.static(__dirname + '/public'));

// Подключение модуля для обработки запросов
const processing = require("./part")

//#endregion 

app.get('/', (req, res) => {
  console.log("reload page")
  res.sendFile(__dirname + "/authorisation.html")
});

app.use("/signin", function(req, res){
  console.log("signin")
  // open the database
  let db = openDatabase()

  let login = req.query.login;
  let password = req.query.password;

  sql = `SELECT * FROM users
         WHERE (login = "${login}" and password = "${password}")`

  db.get(sql, (err, row) => {
    if (err) {
      console.log("database error")
      return console.error(err.message);
    }
    else{
      if(row){
        console.log(row)
        res.json(row)
      }
      else{
        console.log('No users found');
        var obj = {
          status: "none"
        }
        res.send(obj);
      }
    }
  });

  // close the database
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Close the database connection.');
  });
});

app.post("/register", async function(req, res){
  console.log("start registration")
  
  // open the database
  let db = openDatabase()
  
  // Потрошим тело запроса.
  var login = req.body.login
  var password = req.body.password
  var status = req.body.status
  var id = req.body.id
  
  // select для студента
  if(status == "Student"){
    sql = `SELECT * FROM Student
           WHERE (student_id = ${id})`;
  }
  // select для препода, зава и декана
  else {
    sql = `SELECT * FROM ${status}
           WHERE (passport_number = ${id})`;
  }

  var request_obj = {
    result: "",
    message: ""
  }

  // Выполняем select для проверки наличия id в базе
  db.get(sql, (err, row) => {
    if (err) {
      console.log("database error")
      return console.error(err.message);
    }
    else{
      if(row){
        sql_check_login = `SELECT * FROM users
        WHERE (login = "${login}")`;
        
        // Если в базе есть подходящий id, проверяем уникальность логина
        db.get(sql_check_login, (err, row) => {
          if (err) {
            console.log("database error")
            return console.error(err.message);
          }
          else {
            if(row){
              request_obj.result = "error"
              request_obj.message = "логин занят"
              console.log(request_obj)
              res.send(request_obj)
            }
            else {
              // Если логин свободен, проверяем уникальность id
              sql_check_id = `SELECT * FROM users
              WHERE (id = ${id})`;

              db.get(sql_check_id, (err, row) => {
                if (err) {
                  console.log("database error")
                  return console.error(err.message);
                }
                else {
                  if(row){
                    request_obj.result = "error"
                    request_obj.message = "пользователь уже есть в базе"
                    console.log(request_obj)
                    res.send(request_obj)
                  }
                  else{
                    // А вот теперь можно внести новую запись в таблицу
            
                    sql_add_user = `INSERT INTO users (login, password, status, id)
                    VALUES ("${login}", "${password}", "${status}", "${id}")`;

                    db.run(sql_add_user)

                    request_obj.result = "success"
                    request_obj.message = "всё ok"
                    console.log(request_obj)
                    res.send(request_obj)
                  }
                }
              })
            }
          }
        })
        
      }
      else{
        request_obj.result = "error"
        request_obj.message = "В базе нет такого id"
        console.log(request_obj)
        res.send(request_obj)
      }
    }
  });

  // close the database
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Close the database connection.');
  });
});

app.post('/commonpost', async function(req, res) /*=>*/ {
  console.log("common POST request")
  console.log(req.body)
  
  var result
  var status = req.body.user.status
  var id = req.body.user.id
  var password = req.body.user.password // мб нафиг надо
  var option = req.body.option
  var value = req.body.value

  switch (req.body.option) {
    case "getJournal":
      result = processing.getJournal(status, id, option, value)
      break;

    default:
      console.log("WTF: What is This Function")
      break;
  }
  
  // КОРОЧЕ
  // Идея вот в чём: все запросы на работу с данными формируются 
  // и обращаются к одной функции сервера. Её поведение различно, 
  // в зависимости от содержания запроса.

  // option - название действия. По нему будет выполняться ветвление.
  // value - набор параметров запроса. Так как это может быть объект, 
  // то параметров может быть сколько угодно.
  
  var lol = {
    data: result,
    lol: "kek",
    f: 5
  }

  res.send(lol)
});

app.listen(port, () => {
  console.log("localhost server start")
});

function openDatabase() {
  let db = new sqlite3.Database('dataBase.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message)
      console.log(err.message)
    }
    console.log('open the database.')
  })
  return db
};

/*
app.get('/get_workspace', (req, res) => {
  console.log("sending workspace")
  console.log(req.query)
  res.send("lol")
  //res.sendFile(__dirname + "/student_workspace.html")
})*/