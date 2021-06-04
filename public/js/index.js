//#region Global Variables
var workSpace = document.getElementById("main_workspace")
var signInForm = document.getElementById("sign_in_form")
var registerForm = document.getElementById("register_form")
var statusBar = document.getElementById("status")
const port = 8080
//const serverAdress = "app-7a6494a2-dba4-4d14-9015-79a8d41453d7.cleverapps.io"//for Server
const serverAdress =   "app_e5cc70ae-bb85-4b52-a5ce-18603c0b921e.cleverapps.io"//for Server2
//#endregion
function userStatusShortName(str = null) {
  // Возвращает одно/двух буквенный код статуса. Например Student = S.
  // По умолчанию возвращает код текущего статуса.
  if (str == null)
    str = localStorage.getItem("userStatus");
  if (str == "Student")
    return "S"
  if (str == "Teacher")
    return "T"
  if (str == "DepartmentManager")
    return "DM"
  if (str == "FacultyManager")
    return "FM"
  if (str == "Admin")
    return "A"
}
function signIn() {
  // Получает данные из формы авторизации и отправляет GET запрос на сервер, 
  // если в таблице users есть подходящий пользователь, то сервер присылает все его данные.
  // Функция инициирует обновление рабочего простанства.
  var login = document.getElementById("login").value;
  var password = document.getElementById("password").value;
  //var url = "http://localhost:8080/signin" + "?login=" + login + "&password=" + password
  var url = `http://${serverAdress}/signin?login=${login}&password=${password}`
  fetch(url, {
    method: 'GET', 
    mode: 'no-cors',
    headers: {
	  'Content-Type': 'application/json;charset=utf-8'
    }
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if(data.status == "none")
        alert("Неправильное имя пользоваеля или пароль")
      else {
        updateCurrentUser(data);
        updateWorkspace();
      }
    });
}
function register() {
  // Получает данные из полей формы регистрации и отправляет POST запрос на сервер
  // Если в таблице users ещё нет такой записи и в одной из таблий пользователей есть такой
  // То данные добавляются в users и инициируется обновления ребочего пространства.
  var status = document.getElementsByName("status_button");
  var login = document.getElementById("user_login").value;
  var password = document.getElementById("user_password").value;
  var id = document.getElementById("user_id").value;
  for (var i = 0; i < status.length; i++) {
    if (status[i].checked) {
      var user_data = {
        login: login,
        password: password,
        status: status[i].value,
        id: id
      }
    }
  }
  //url = "http://localhost:8080/register"
  //url = `http://localhost:${port}/register`
  url = `http://${serverAdress}/register`
  fetch(url, {
    method: 'POST', 
    headers: {
	  'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(user_data)
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
      if(data.result == "error"){
        // Если сервер не может зарегать пользователя, выводим сообщение об ошибке
        alert(data.message)
      }
      else{
        updateCurrentUser(user_data)
      }
    });
}
function updateCurrentUser(new_data = null) {
  // Обновляет рабочее пространство. Если в localStorage содержится статус пользователя, 
  // то скрываем форму авторизации и показываем рабочее пространство.
  // Если статуса нет, то скрывам рабочее пространство и показываем форму авторизации.
  if (new_data){
    // Если передали данные, то заносим их в localStorage
    localStorage.setItem("userStatus", new_data.status)
    localStorage.setItem("userLogin", new_data.login)
    localStorage.setItem("userId", new_data.id)
    
    workSpace.style.display = 'block';
    signInForm.style.display = 'none';
    registerForm.style.display = 'none';
    statusBar.textContent = localStorage.getItem("userStatus");
  }
  else{
    if(localStorage.getItem("userStatus") === null) {
      workSpace.style.display = 'none';
      signInForm.style.display = 'block';
      registerForm.style.display = 'none';
      // очистка полей ввода
      document.getElementById("login").value = ''
      document.getElementById("password").value = ''
    } else {
      // Этот else отработает в случае постороннего изменения переменной в localStorage.
      workSpace.style.display = 'block';
      signInForm.style.display = 'none';
      statusBar.textContent = localStorage.getItem("userStatus");
    }
  }
}
function setOptionsSelect() {
  console.log("WORK")
  var temp = document.getElementById("options_menu")
  console.log(temp.value)
  if (temp.value == "getStatictic")
    document.getElementById("date").style.display = "none"
}
function setOptionsMenu() {
  // Изменяет выпадающий список панель с доступными для выбора параметрами
  var options = document.getElementsByClassName("wss")
  for(i = 0; i < options.length; i++){
    // Выключает текущий пункт меню.
    options[i].style.display = "none"
    
    // Вытягиваем из id массив коротких имён статусов
    var idName = options[i].id
    str = idName.substr(7)
    var arr = str.split('/')
    // Проходится по всему id пункта.
    for(j = 0; j < arr.length; j++){
      // Если пункт подходит, то включаем.
      if (arr[j] == userStatusShortName()){
        options[i].style.display = "block"
        options[i].selected = true // Это заплатка.
        // Почему-то первый элемент был по умолчанию выбран, а поэтому виден для всех.
        // Теперь выбирается последний элемент.
      }
    }
  }
}
function getData(){
  // Обращение к серверу и передача полученных данных для заполнения таблицы.
  console.log("get data from server")
  var optionData = document.getElementById("options_menu")
  var userLogin = localStorage.getItem("userLogin")
  var userStatus = localStorage.getItem("userStatus")
  var userId = localStorage.getItem("userId")
  
  var reguestObject = {
    user: {
      login: userLogin,
      status: userStatus,
      id: userId,
    },
    option: optionData.value,
  }
  // Коллекция всех селекторов
  var selectors = Array.from(document.getElementsByClassName("selectors"))
  // Выкидываем невидимые, а значит недоступные текущему пользователю селекторы
  for (var i = 0; i < selectors.length; i++) {
    if (selectors[i].style.display == "none"){
      selectors.splice(i, 1)
      i--
    }
  }
  for (var i = 0; i < selectors.length; i++) {
    reguestObject[selectors[i].id] = document.getElementById(selectors[i].id).value
  } 
  
  console.log("request:")
  console.log(reguestObject)
  url = `http://${serverAdress}/commonpost`
  fetch(url, {
    method: 'POST', 
    headers: {
    'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(reguestObject)
  })
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    console.log("response:")
    displayData(data, reguestObject.date)
  });
}
function signOut() {
  // Удаляет логин/статус/id из локального хранилища
  localStorage.clear()
  updateCurrentUser()
  updateWorkspace()
}
function lol(){
  // А это для нескучной отладки ;)
  alert("lol");
}
function updateWorkspace() {
  // Изменяет область рабочего пространства для выбора параметров запроса
  // под текущего пользователя
  
  // изменяет выпадающий список вариантов запроса
  setOptionsMenu()
  // изменяет выпадающий список групп
  selectGroupSetOptions()
  // очищает таблицу
  document.getElementById("blank_field").innerHTML = "";
  var status = localStorage.getItem("userStatus");
  
  // Для верности скрывает все панели
  var selectors = document.getElementsByClassName("selectors")
  for (var i = 0; i < selectors.length; i++) {
    selectors[i].style.display = "none"
  }
  // включает панели выборочно
  var selectDate = document.getElementById("date")
  var getDataButton = document.getElementById("get_data_button")
  var selectGroup = document.getElementById("group")
  // Собственно "разрешение" элементов выбора
  switch (status) {
    case "Student": {
      selectDate.style.display = "inline"
      getDataButton.style.display = "inline"
      break;
    }
    case "Teacher": {
      selectDate.style.display = "inline"
      selectGroup.style.display = "inline"
      getDataButton.style.display = "inline"
      break;
    }
    case "Admin": {
      selectDate.style.display = "inline"
      selectGroup.style.display = "inline"
      getDataButton.style.display = "inline"
      break;
    }
    default:
      break;
  }
}
function selectGroupSetOptions() {
  // Генерирует выпадающий список групп
  url = `http://${serverAdress}/get_groups`
  fetch(url, {
    method: 'GET',
    //mode: 'no-cors',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    }
  })
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    // А теперь генерируем выпадающий список
    var listContent
    for (i = 0; i < data.length; i++) {
      listContent += `<option value = "${data[i].group_id}">${data[i].abbreviation}-${data[i].course_number}</option>`
    }
    document.getElementById("group").innerHTML = listContent
  });
}
function displayData(data, date) {
  // Получение массива JSON и генерация таблицы и вставка её в <pre>
  var table = new Table(data, date);
  var blank = document.getElementById("blank_field");
  blank.innerHTML = table.generateTableHTML();
}
main()
function main() {
  console.log("main");
  updateCurrentUser();
  updateWorkspace();
}