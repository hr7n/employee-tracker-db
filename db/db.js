require("dotenv").config();
const mysql = require("mysql2/promise");
const inquirer = require("inquirer");
// const db = require("../server.js");

const main = async () => {
  const db = await mysql.createConnection(
    {
      host: "localhost",
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    console.log(`Connected to the employee_tracker database.`)
  );
  try {
    while (true) {
      const { action } = await inquirer.prompt([
        {
          type: "list",
          name: "action",
          message: "What would you like to do?",
          choices: [
            "View all departments",
            "View all roles",
            "View all employees",
            "Add a department",
            "Add a role",
            "Add an employee",
            "Update an employee role",
            "Exit",
          ],
        },
      ]);

      switch (action) {
        case "View all departments":
          const departments = await db.query("SELECT * FROM department");
          console.table(departments);
          break;
        case "View all roles":
          const roles = await db.query("SELECT * FROM role");
          console.table(roles);
          break;
        case "View all employees":
          const employees = await db.query("SELECT * FROM employee");
          console.table(employees);
          break;
        case "Add a department":
          const { departmentName } = await inquirer.prompt([
            {
              type: "input",
              name: "departmentName",
              message: "What is the name of the department?",
            },
          ]);
          await db.query(
            "INSERT INTO department (name) VALUES (?)",
            departmentName
          );
          break;
        case "Add a role":
          const { roleName, salary, departmentId } = await inquirer.prompt([
            {
              type: "input",
              name: "roleName",
              message: "What is the name of the role?",
            },
            {
              type: "input",
              name: "salary",
              message: "What is the salary of the role?",
            },
            // {
            //   type: "input",
            //   name: "departmentId",
            //   message: "What is the department ID of the role?",
            // },
          ]);
          await db.query(
            "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)",
            [roleName, salary, departmentId]
          );
          break;
        case "Add an employee":
          const { firstName, lastName, employeeRoleName, managerName } =
            await inquirer.prompt([
              {
                type: "input",
                name: "firstName",
                message: "What is the employee's first name?",
              },
              {
                type: "input",
                name: "lastName",
                message: "What is the employee's last name?",
              },
              {
                type: "input",
                name: "employeeRoleName",
                message: "What is the employee's role?",
              },
              {
                type: "input",
                name: "managerName",
                message: "Who is the employee's manager?",
              },
            ]);

          const [roleRows] = await db.query(
            "SELECT id FROM role WHERE title = ?",
            [employeeRoleName]
          );
          const roleId = roleRows[0].id;

          const [managerRows] = await db.query(
            "SELECT id FROM employee WHERE CONCAT(first_name, ' ', last_name) = ?",
            [managerName]
          );
          const managerId = managerRows[0].id;

          await db.query(
            "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
            [firstName, lastName, roleId, managerId]
          );
          break;
        case "Update an employee role":
          const { employeeId, newRoleId } = await inquirer.prompt([
            {
              type: "input",
              name: "employeeId",
              message: "What is the ID of the employee you want to update?",
            },
            {
              type: "input",
              name: "newRoleId",
              message: "What is the new role ID for the employee?",
            },
          ]);
          await db.query("UPDATE employee SET role_id = ? WHERE id = ?", [
            newRoleId,
            employeeId,
          ]);
          break;
        case "Exit":
          db.end();
          return;
      }
    }
  } catch (err) {
    console.log(err);
  }
};

main();
