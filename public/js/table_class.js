class Table {
  _data = "";
  _date = "";
  _permissions = {};
	constructor(data, date) {
    // >_< смотри не перепутай
    console.log(data)
    if (data.res == "empty"){
      this._data = null;
    }
    else {
      this._data = data.data;
    }
    this._permissions = data.permissions;
    this._date = date;
	}
	generateTableHTML() {
    console.log(this._data)
    console.log(this._permissions)
    if (this._data == null){
      console.log("В журнале нет записей");
      return "В журнале нет записей";
    } else {
      var propertyArray = Object.getOwnPropertyNames(this._data[0])
      var tableContent = "<table>";
      tableContent += "<tr>";
      for(i = 0; i < propertyArray.length; i++) {
        // Сокрытие поля student_id
        if(propertyArray[i] != "student_id")
          tableContent += `<th>${propertyArray[i]}</th>`;
      }
      if (this._permissions.mutable) {
        tableContent += `<th colspan=2>действия</th>`;
      }
      tableContent += "</tr>";
      
      for(i = 0; i < this._data.length; i++) {
        tableContent += "<tr>";
        var singleObject = this._data[i];
        for(j = 0; j < propertyArray.length; j++) {
          // Сокрытие поля student_id
          if(propertyArray[j] != "student_id")
            tableContent += `<td>${singleObject[propertyArray[j]]}</td>`;
        }
        if (this._permissions.mutable) {
          tableContent += `<td><button onclick="Table.changeTuple('${this._date}', ${singleObject['student_id']},'${singleObject['пара']}')" class="table_button change_button">изменить</button></td>`;
          tableContent += `<td><button onclick="Table.deleteTuple('${this._date}', ${singleObject['student_id']},'${singleObject['пара']}')" class="table_button delete_button">удалить</button></td>`;
        }
        tableContent += "</tr>";
      }
      tableContent += "</table>";
      return tableContent;
    }
	}
  static changeTuple(date, student_id, class_number) {
    // Тупо меняем присутствие: + на - и наоборот
    Table.commonForChangeAndDelete(date, student_id, class_number, "changeTuple");
  }
  static deleteTuple(date, student_id, class_number) {
    // Тупо удаляем кортеж из бд.
    Table.commonForChangeAndDelete(date, student_id, class_number, "deleteTuple");
  }
  static commonForChangeAndDelete(date, student_id, class_number, action) {
    console.log(action);
    var reguestObject = {
      user: {
        login: localStorage.getItem("userLogin"),
        status: localStorage.getItem("userStatus"),
        id: localStorage.getItem("userId"),
      },
      option: action,
      value: {
        date: date,
        student_id: student_id,
        class_number: class_number,
      }
    }
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
      if (data.res == "empty")
        console.log("ошибка");
      getData();
    });
  }
}