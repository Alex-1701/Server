/*const Status = Object.freeze({
	USER:		Symbol("User"),
    STUDENT:	Symbol("Student"),
    TEACHER:  	Symbol("Teacher"),
    ADMIN:		Symbol("Admin")
});*/

class User {
	status = "User";

	constructor(login, id, status) {
		this.login = login;
		this.id = id;
		this.status = status;
	}

	getStatus() {
		return this.status;
	}
}

class Student extends User {
	constructor(login, id, status = "Student"){
		super(login, id, status);
	}

	showGroupJournal() {
	
	}
}

class Teacher extends Student {
	constructor(login, id, status = "Teacher"){
		super(login, id, status);
	}
}

class Admin extends Teacher {
	constructor(login, id, status = "Admin"){
		super(login, id, status);
	}
}