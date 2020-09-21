/*********************************************************************
** Program name: CS340 - Project Website
** Author: Scott Edwardsen and Chris Mello
** Date: 3/19/2019
** Description: Used to connect to database
*********************************************************************/



var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_edwarsco',
  password        : '0009',
  database        : 'cs340_edwarsco'
});

module.exports.pool = pool;
