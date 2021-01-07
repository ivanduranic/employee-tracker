const mysql = require("mysql");
const util = require("util");
const inquirer = require("inquirer");

//create my sql connection
var connection = mysql.createConnection({
  host: "localhost",

  // Your port
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "Wanderlei@1",
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

    //function to provide departments as choices
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
    //send data
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

  //Define addEmployee function
  async function addEmployee() {
    const roleTitle = {};
    const managerId = {};

    const roleChoices = await availableRole();

    const managerChoices = await availableManager();

    const questions = [
      {
        name: "firstName",
        type: "input",
        message: "What is the employee's first name?",
      },
      {
        name: "lastName",
        type: "input",
        message: "What is the employee's last name?",
      },
      {
        name: "roleID",
        type: "list",
        message: "Please select the role for this particular employee?",
        choices: roleChoices,
      },
      {
        name: "manager",
        type: "confirm",
        message: "Is this a manager or superviser role?",
      },
      {
        name: "managerID",
        type: "list",
        message: "Please select this employee's manager/supervisor?",
        choices: managerChoices,
      },
    ];

    //function to provide departments as choices

    //send data
    const answer = await inquirer.prompt(questions);
    const res = await connection.query(
      "INSERT INTO employee (first_name, last_name, role_id, isManager, superviserORmanager_id) VALUES (?,?,?,?,?)",
      [
        answer.firstName,
        answer.lastName,
        answer.roleID,
        answer.manager,
        answer.managerID,
      ]
    );
    console.log(
      `${answer.firstName} ${answer.lastName} was added as an employee. Next...`
    );
    interactWithDB();
  }
}

//Defining view function
function view() {
  inquirer
    .prompt({
      name: "action",
      type: "rawlist",
      message: "What would you like to view?",
      choices: [
        "Departments",
        "Roles",
        "Employees",
        "Employees by manager",
        "The total utilized budget of a department",
      ],
    })
    .then(function (answer) {
      switch (answer.action) {
        case "Departments":
          availableDepartment();
          break;

        case "Roles":
          availableRoles();
          break;

        case "Employees":
          availableEmployee();
          break;

        case "Employees by manager":
          viewEmployeesByManager();
          break;

        case "The total utilized budget of a department":
          viewTheTotalUtilizedBudget();
          break;
      }
    });

  function availableDepartment() {
    let sql = "SELECT * FROM department";
    connection.query(sql, function (err, result) {
      if (err) throw err;
      for (let i = 0; i < result.length; i++) {
        console.log(result[i].name);
        interactWithDB();
      }
    });
  }
  function availableRoles() {
    let sql = "SELECT * FROM role";
    connection.query(sql, function (err, result) {
      if (err) throw err;
      for (let i = 0; i < result.length; i++) {
        console.log(result[i].title);
        interactWithDB();
      }
    });
  }
  function availableEmployee() {
    let sql = "SELECT * FROM employee";
    connection.query(sql, function (err, result) {
      if (err) throw err;
      for (let i = 0; i < result.length; i++) {
        console.log(`${result[i].first_name} ${result[i].last_name}`);
        interactWithDB();
      }
    });
  }

  //function for viewing employees by their manager
  async function viewEmployeesByManager() {
    let managersChoices = [];

    managersChoices = await availableManager();

    await inquirer
      .prompt({
        name: "action",
        type: "list",
        message: "Which manager would you like to view's employee(s)",
        choices: managersChoices,
      })
      .then(function (answer) {
        connection.query(
          "SELECT * FROM employee WHERE superviserORmanager_id='?'",
          answer.action,
          function (err, result) {
            if (err) throw err;
            for (let i = 0; i < result.length; i++) {
              console.log(`${result[i].first_name} ${result[i].last_name}`);
              interactWithDB();
            }
          }
        );
      });
  }
  //function for viewing a total utilized budget
  async function viewTheTotalUtilizedBudget() {
    let departmentChoices = [];

    departmentChoices = await availableDepartments();

    await inquirer
      .prompt({
        name: "action",
        type: "list",
        message:
          "Which department would you like to view the total utilized budget?",
        choices: departmentChoices,
      })
      .then(function (answer) {
        connection.query(
          "SELECT SUM(role.salary) as total, department.name as name FROM ((role INNER JOIN employee ON role.id = employee.role_id) INNER JOIN department ON role.department_id = department.id) WHERE department.id = ? GROUP BY department.id",
          answer.action,
          function (err, result) {
            if (err) throw err;
            console.log(
              `The total utilized budget for ${result[0].name} department is $${result[0].total}`
            );
            interactWithDB();
          }
        );
      });
  }
}

//Defining function update
function update() {
  inquirer
    .prompt({
      name: "action",
      type: "rawlist",
      message: "Who would you like to update?",
      choices: ["Employee's role", "Employee's manager"],
    })
    .then(function (answer) {
      switch (answer.action) {
        case "Employee's role":
          updateEmployeesRole();
          break;

        case "Employee's manager":
          updateEmployeesManager();
          break;
      }
    });

  async function updateEmployeesRole() {
    let myChoices = [];
    let myRoleChoices = [];

    myRoleChoices = await availableRole();

    Choices = await availableEmployees();

    const answer = await inquirer.prompt([
      {
        name: "action",
        type: "list",
        message: "Which employee would you like to update",
        choices: myChoices,
      },
      {
        name: "newRole",
        type: "list",
        message: "What's the employee's new role",
        choices: myRoleChoices,
      },
    ]);

    connection.query(
      "UPDATE employee SET role_id ='?' WHERE id='?'",
      [answer.newRole, answer.action],
      function (err, result) {
        if (err) throw err;
        console.log("updated! next...");
        interactWithDB();
      }
    );
  }
  async function updateEmployeesManager() {
    let Choices = [];
    let myManagerChoices = [];

    myManagerChoices = await availableManager();

    Choices = await availableEmployees();

    const answer = await inquirer.prompt([
      {
        name: "action",
        type: "list",
        message: "Which employee would you like to update",
        choices: Choices,
      },
      {
        name: "newManager",
        type: "list",
        message: "What's the employee's new manager",
        choices: myManagerChoices,
      },
    ]);

    connection.query(
      "UPDATE employee SET superviserORmanager_id ='?' WHERE id='?'",
      [answer.newManager, answer.action],
      function (err, result) {
        if (err) throw err;
        console.log("updated! next...");
      }
    );
  }
}

// Defining function toDelete
function toDelete() {
  inquirer
    .prompt({
      name: "action",
      type: "rawlist",
      message: "What would you like to delete?",
      choices: ["Departments", "Roles", "Employees"],
    })
    .then(function (answer) {
      switch (answer.action) {
        case "Departments":
          deleteMyDepartments();
          break;

        case "Roles":
          deleteMyRoles();
          break;

        case "Employees":
          deleteMyEmployees();
          break;
      }
    });

  async function deleteMyDepartments() {
    let listOfDepartments = [];

    listOfDepartments = await availableDepartments();

    await inquirer
      .prompt({
        name: "action",
        type: "list",
        message: "Which department would you like to delete",
        choices: listOfDepartments,
      })
      .then(function (answer) {
        connection.query(
          "DELETE FROM department WHERE id='?'",
          answer.action,
          function (err, result) {
            if (err) throw err;
            console.log("deleted!! next...");
            interactWithDB();
          }
        );
      });
  }
  async function deleteMyRoles() {
    let myRoleChoices = [];

    myRoleChoices = await availableRole();

    await inquirer
      .prompt({
        name: "action",
        type: "list",
        message: "Which role would you like to delete",
        choices: myRoleChoices,
      })
      .then(function (answer) {
        connection.query(
          "DELETE FROM role WHERE id='?'",
          answer.action,
          function (err, result) {
            if (err) throw err;
            console.log("deleted!! next...");
            interactWithDB();
          }
        );
      });
  }
  async function deleteMyEmployees() {
    let Choices = [];

    Choices = await availableEmployees;

    await inquirer
      .prompt({
        name: "action",
        type: "list",
        message: "Which employee would you like to delete",
        choices: Choices,
      })
      .then(function (answer) {
        connection.query(
          "DELETE FROM employee WHERE id='?'",
          answer.action,
          function (err, result) {
            if (err) throw err;
            console.log("deleted!! next...");
            interactWithDB();
          }
        );
      });
  }
}
