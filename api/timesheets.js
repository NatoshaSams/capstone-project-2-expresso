const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//Checking for invalid timesheets
timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
  const sql = 'SELECT * FROM Timesheet WHERE id = $timesheetId';
  const values = {$timesheetId: timesheetId};
  db.get(sql, values, (error, timesheet) => {
    if (error) {
      next(error);
    } else if (timesheet) {
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

//Get a timesheet
timesheetsRouter.get('/', (req, res, next) => {
  const sql = 'SELECT * FROM Timesheet WHERE employee_id = $employeeId';
  const values = { $employeeId: req.params.employeeId};
  db.all(sql, values, (error, timesheets) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({timesheets: timesheets});
    }
  });
});

//Create a new timesheet
timesheetsRouter.post('/', (req, res, next) => {
  const hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date,
        employeeId = req.params.employeeId;
  const employeeSql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
  const employeeValues = {$employeeId: employeeId};
  db.get(employeeSql, employeeValues, (error, employee) => {
    if (error) {
      next(error);
    } else {
      if (!hours || !rate || !date) {
        return res.sendStatus(400);
      }
      if (!employee) {
        return res.sendStatus(404);
      }
      const sql = 'INSERT INTO Timesheet (hours, rate, date, employee_id)' +
          'VALUES ($hours, $rate, $date, $employeeId)';
      const values = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $employeeId: employeeId
      };
      db.run(sql, values, function(error) {
        if (error) {
          next(error);
        } else {
          db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`,
            (error, timesheet) => {
              res.status(201).json({timesheet: timesheet});
            });
        }
      });
    }
  });
});

//Update a timesheet
timesheetsRouter.put('/:timesheetId', (req, res, next) => {
  const hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date,
        employeeId = req.params.employeeId,
        timesheetId = req.params.timesheetId;
  const employeeSql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
  const employeeValues = {$employeeId: employeeId};
  db.get(employeeSql, employeeValues, (error, employee) => {
    if (error) {
      next(error);
    } else {
      if (!hours || !rate || !date || !employeeId) {
        return res.sendStatus(400);
      }
      if (!employee) {
        return res.sendStatus(404);
      }
      const sql = 'UPDATE Timesheet SET hours = $hours, rate = $rate, ' +
          'date = $date, employee_id = $employeeId ' +
          'WHERE Timesheet.id = $timesheetId';
      const values = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $employeeId: employeeId,
        $timesheetId: timesheetId
      };
      db.run(sql, values, function(error) {
        if (error) {
          next(error);
        } else {
          db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`,
            (error, timesheet) => {
              res.status(200).json({timesheet: timesheet});
            });
        }
      });
    }
  });
});

//Delete an existing timesheet
timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
  const sql = 'DELETE FROM Timesheet WHERE Timesheet.id = $timesheetId';
  const values = {$timesheetId: req.params.timesheetId};
  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(204);
    }
  });
});

module.exports = timesheetsRouter;