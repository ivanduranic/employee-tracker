const mysql = require("mysql");
const util = require("util");
const inquirer = require("inquirer");

//create my sql connection
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "firm_DB",
});

connection.connect();

//The app function
interactWithDB();
connection.query = util.promisify(connection.query);

function interactWithDB() {
  inquirer
    .prompt({
      name: "action",
      type: "rawlist",
      message: "What would you like to do?",
      choices: ["Add", "View", "Update", "Delete", "Exit"],
    })
    .then(function (answer) {
      switch (answer.action) {
        case "Add":
          add();
          break;

        case "View":
          view();
          break;

        case "Update":
          update();
          break;

        case "Delete":
          toDelete();
          break;
        case "Exit":
          process.exit();
          break;
      }
    });
}

//Defining add function
function add() {
  inquirer
    .prompt({
      name: "action",
      type: "rawlist",
      message: "What would you like to add?",
      choices: ["Department", "Role", "Employee"],
    })
    .then(function (answer) {
      switch (answer.action) {
        case "Department":
          addDepartment();
          break;

        case "Role":
          addRole();
          break;

        case "Employee":
          addEmployee();
          break;
      }
    });

  function addDepartment() {
    inquirer
      .prompt({
        name: "action",
        type: "input",
        message: "What the name of the department?",
      })
      .then(function (answer) {
        let sql = "INSERT INTO department (name) VALUES (?)";
        connection.query(sql, answer.action, function (err, result) {
          if (err) throw err;
          console.log("Department added! Next...");
          interactWithDB();
        });
      });
  }

  //Define addRole function
  async function addRole() {
    let myChoices = [];
    const departmentName = {};

    availableDepartments();

    const questions = [
      {
        name: "title",
        type: "input",
        message: "What is the job title?",
      },
      {
        name: "salary",
        type: "input",
        message: "What is the salary for this title?",
      },
      {
        name: "departmentID",
        type: "list",
        message: "Please select the department for this particular role.",
        choices: myChoices,
      },
    ];
    //const availableD = availableDepartments();
    //const departChoices = availableD.map();

    //function to provide departments as choices and reference it ID to the role
    function availableDepartments() {
      let sql = "SELECT * FROM department";
      connection.query(sql, async function (err, result) {
        if (err) throw err;
        for (let i = 0; i < result.length; i++) {
          myChoices.push(result[i].name);
          departmentName[result[i].name] = result[i].id;
        }
      });
    }
    //send data to the
    inquirer.prompt(questions).then(function (answer) {
      connection.query(
        "INSERT INTO role (title, salary, department_id) VALUES (?,?,?)",
        [answer.title, answer.salary, departmentName[answer.departmentID]],
        function (err, result) {
          if (err) throw err;
          console.log("Role added! Next...");
          interactWithDB();
        }
      );
    });
  }
}
