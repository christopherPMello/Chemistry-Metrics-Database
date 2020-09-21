
/*********************************************************************
** Program name: CS340 - Project Website
** Author: Scott Edwardsen and Chris Mello
** Date: 3/19/2019
** Description: Used to Run Node.js
*********************************************************************/


'use strict';
//Setup express, handlebars, and body-parser
let express = require('express');
let app = express();
let handlebars = require('express-handlebars').create({defaultLayout: 'main'});
let bodyParser = require('body-parser');
let mysql = require('./dbStart.js');
app.engine('handlebars', handlebars.engine);

app.set('view engine', 'handlebars');
app.set('port', process.argv[2]);

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Register public css folder
app.use(express.static(__dirname + '/public'));

app.get('/homePage', function(req, res){
    res.render('homePage');
});

app.get('/', function(req, res){
    res.redirect('homePage');
});

//Run a select * query against the table specified in the post
app.post('/homePage', function (req, res, next){
    let content = {};
	
    mysql.pool.query('SELECT * FROM ??;',
    [req.body.rButton], function(err, rows, fields){
        if(err){
			
			content.errorMsg = 'Failed to display table.';
			res.render('homePage', content);
			return;
			
        }
        if(rows != null){
			
			if (typeof Object.keys(rows) !== 'undefined' && Object.keys(rows).length > 0) {
				content.results = rows;
				content.header = Object.keys(rows[0]);
				res.render('homePage', content);
			}
			else {
				
				content.errorMsg = 'Failed to display table.';
				res.render('homePage', content);
				return;
					
				
			}
    }
	else{
		
			content.errorMsg = 'Failed to display table.';
			res.render('homePage', content);
			return;
	}
    });
});

app.get('/lookup', function(req, res){
    res.render('lookup');
});

//Run a search based on the like criteria supplied by the user
app.post('/lookup', function(req, res, next){
    let content = {};
	
	let queryToDatabase = "SELECT COA.Report_ID, COA.Customer_Name, COA.Report_Status, COA.COA_Send_Date from `COA` where " + [req.body.SQL_Like_Clause];
	
	
	mysql.pool.query(queryToDatabase,
	function(err, rows, fields){
        if(err){
            next(err);
            return;
        }
		else {
				
				var selectQueryResults = []; 
					
				for(var entry in rows){
					var techEntry = {'Report_ID':rows[entry].Report_ID,
							'Customer_Name': rows[entry].Customer_Name, 
							'Report_Status': rows[entry].Report_Status, 
							'COA_Send_Date': rows[entry].COA_Send_Date 
							};
							
					selectQueryResults.push(techEntry);                  
				}
				
				content.results = selectQueryResults;
				
				
				
				res.send(JSON.stringify(content));
		}
		
    });
	
});

//Run a select query so we can diplay the contents to the table and create a dropdown with values from the database.  
app.get('/batchTransaction', function(req,res){
	
    let  content = {};
    
		mysql.pool.query('SELECT Batch_Transaction.Transaction_Number FROM `Batch_Transaction`;',
    function(err, rows, fields){
        if(err){
			res.render('batchTransaction', content);
			return;
        }
		
		mysql.pool.query('select B.Transaction_Number,B.Batch_Status,T.First_Name,T.Last_Name,B.Batch_ID  from `Batch_Transaction` B left join `Technician` T on B.Technician_ID = T.Technician_ID;',
        function(err, rows, fields){
            if(err){
                next(err);
                return;
            }
        content.header = Object.keys(rows[0]);
        content.results = rows;
		
        let newRow = deleteDuplicates(rows);
        
        content.drop = newRow;
        res.render('batchTransaction', content);
    });
});
});


//Update the record in the database and then
//Run a select query so we can diplay the contents to the table and create a dropdown with values from the database.  
app.post('/batchTransaction', function(req, res, next){
    let content = {};
	let recordsUpdated = 0;
	
    mysql.pool.query('UPDATE `Batch_Transaction` SET Batch_Transaction.Batch_Status = ? WHERE Batch_Transaction.Transaction_Number = ?;',
    [req.body.check, req.body.Transaction_Number_Select], function(err, rows, fields){
        if(err){
			content.errorMsg = 'Update Failed.  Please try again';
			res.render('batchTransaction', content);
			return;
            
        }
		recordsUpdated = rows.affectedRows;
        
		
        mysql.pool.query('select B.Transaction_Number,B.Batch_Status,T.First_Name,T.Last_Name,B.Batch_ID  from `Batch_Transaction` B left join `Technician` T on B.Technician_ID = T.Technician_ID;',
        function(err, rows, fields){
            if(err){
                next(err);
                return;
            }
        content.header = Object.keys(rows[0]);
        content.results = rows;
		
		
		
		//flag to identify that no records were updated
		if(recordsUpdated <= 0) {
			content.updatedRecords = 1;
		}
		
		 
		mysql.pool.query('SELECT Batch_Transaction.Transaction_Number FROM `Batch_Transaction`;',
		function(err, rows2, fields){
        if(err){
			res.render('batchTransaction', content);
			return;
        }
		
		content.header2 = Object.keys(rows2[0]);
        content.results2 = rows2;
		
        let newRow = deleteDuplicates(rows2);
        
        content.drop = newRow;
		
		
		res.render('batchTransaction', content);
        });
    
});
});
});

//display the records in the technician table
app.get('/tech', function(req, res){
	
	let content = {};
	  
    mysql.pool.query(
	'SELECT Technician_ID, First_Name, Last_Name from `Technician`',
	function(err, rows, fields){
        if(err){
            next(err);
            return;
        }
		else {
				var selectQueryResults = [];                               
				for(var entry in rows){
					var techEntry = {'Technician_ID':rows[entry].Technician_ID,
							'First_Name': rows[entry].First_Name, 
							'Last_Name': rows[entry].Last_Name, 
							};
							
					selectQueryResults.push(techEntry);                  
				}
				
				content.results = selectQueryResults;
				
				
				
				res.render('tech', content);
		}
		
    });
});


//Crete a new or delete a record in the database for the technician table
app.post('/tech', (req, res, next)=>{
    var content = {};
	
	if("insert" === req.body.type) {
		mysql.pool.query("INSERT INTO `Technician` (Technician.First_Name, Technician.Last_Name) VALUES (?,?);",
		[req.body.First_Name, 
		req.body.Last_Name], 
		function(error, results, fields){
			if(error){
				
				next(error);
				return;
			}
			
			 content.rowID = results.insertId;
			
			
			res.send(JSON.stringify(content));
		});
		
	} else if("delete" === req.body.type) {
		
		
		mysql.pool.query("DELETE from `Technician` WHERE Technician_ID = ?;",
		[req.body.id], 
			function(err, result,fields){
				if(err){
				  next(err);
				  return;
			   } 
			}

		)};
});


//display the records in the instrument table
app.get('/instrument', function(req, res){
	
	let content = {};
	  
    mysql.pool.query(
	'SELECT Serial_Number, Instrument_Name from `Instrument`',
	function(err, rows, fields){
        if(err){
            next(err);
            return;
        }
		else {
				var selectQueryResults = [];                               
				for(var entry in rows){
					var techEntry = {'Serial_Number':rows[entry].Serial_Number,
							'Instrument_Name': rows[entry].Instrument_Name
							};
							
					selectQueryResults.push(techEntry);                  
				}
				
				content.results = selectQueryResults;
				
				res.render('instrument', content);
		}
		
    });
});


//Crete a new or delete a record in the database for the instrument table
app.post('/instrument', (req, res, next)=>{
    var content = {};
	
	if("insert" === req.body.type) {
		mysql.pool.query("INSERT INTO `Instrument` (Instrument.Serial_Number, Instrument.Instrument_Name) VALUES (?,?);",
		[req.body.Serial_Number, 
		req.body.Instrument_Name], 
		function(error, results, fields){
			if(error){
				
				next(error);
				return;
			}
			
			 content.rowID = results.insertId;
			
			
			res.send(JSON.stringify(content));
		});
		
	} else if("delete" === req.body.type) {
		
		
		mysql.pool.query("DELETE from `Instrument` WHERE Serial_Number = ?;",
		[req.body.id], 
			function(err, result,fields){
				if(err){
				  next(err);
				  return;
			   } 
			}

		)};
});


/*
The code listed below allows a user to insert records into all of the tables in the database.  
Once you insert a new record it displays the table
There are 8 insert pages so there are 8 gets and 8 posts
*/
app.get('/insertCOA', function(req,res){
    res.render('insertCOA');
});

app.post('/insertCOA', function(req, res, next){
        let content = {};
        mysql.pool.query('INSERT INTO `COA` (COA.Customer_Name, COA.Report_Status, COA.COA_Send_Date) VALUES (?,?,?);',
        [req.body.customerName, req.body.check, req.body.coaSendDate], function(err, rows, fields){
            if(err){
                content.errorMsg = 'Insert Failed.  Please try again';
				res.render('insertCOA', content);
				return;
            }
            mysql.pool.query('SELECT * FROM `COA`;',
            function(err, rows, fields){
                if(err){
                    next(err);
                    return;
                }
            content.header = Object.keys(rows[0]);
            content.results = rows;
            res.render('insertCOA', content);
        });
    });
});
app.get('/insertTech', function(req,res){
    res.render('insertTech');
});
app.post('/insertTech', function(req, res, next){
        let content = {};
        mysql.pool.query('INSERT INTO `Technician` (Technician.First_Name, Technician.Last_Name) VALUES (?,?);',
        [req.body.firstName, req.body.lastName], function(err, rows, fields){
            if(err){
                content.errorMsg = 'Insert Failed.  Please try again';
				res.render('insertTech', content);
				return;
            }
            mysql.pool.query('SELECT * FROM `Technician`;',
            function(err, rows, fields){
                if(err){
                    next(err);
                    return;
                }
            content.header = Object.keys(rows[0]);
            content.results = rows;
            res.render('insertTech', content);
        });
    });
});
app.get('/insertBatch', function(req,res){
    let  content = {};
    mysql.pool.query('SELECT Batch.Serial_Number FROM `Batch`;',
    function(err, rows, fields){
        if(err){
			res.render('insertBatch', content);
			return;
        }
        let newRow = deleteDuplicates(rows);
        
        content.drop = newRow;
        res.render('insertBatch', content);
    });
});
app.post('/insertBatch', function(req, res, next){
    let content = {};
    mysql.pool.query('INSERT INTO `Batch` (Batch.Create_Date, Batch.Complete_Date, Batch.Serial_Number) VALUES (?,?,?);',
    [req.body.createDate, req.body.completeDate, req.body.selectOption], function(err, rows, fields){
        if(err){
            content.errorMsg = 'Insert Failed.  Please try again';
			res.render('insertBatch', content);
			return;
        }
        mysql.pool.query('SELECT * FROM `Batch`;',
        function(err, rows, fields){
            if(err){
                next(err);
                return;
            }
        mysql.pool.query('SELECT Batch.Serial_Number FROM `Batch`;',
        function(err, inputRow, fields){
            if(err){
                res.render('insertBatch', content);
                return;
            }
        let newRow = deleteDuplicates(inputRow);
        
        content.drop = newRow;

        
        content.header = Object.keys(rows[0]);
        
        content.results = rows;
        res.render('insertBatch', content);
    });
});
});
});

app.get('/insertTest', function(req,res){
    let  content = {};
    mysql.pool.query('SELECT Batch.Batch_ID FROM `Batch`;',
    function(err, rows, fields){
        if(err){
			res.render('insertBatch', content);
			return;
        }
        let newRow = deleteDuplicates(rows);
        
        content.drop = newRow;
        res.render('insertTest', content);
    });
});

app.post('/insertTest', function(req, res, next){
    let content = {};
    mysql.pool.query('INSERT INTO `Test` (Test.Test_Code, Test.Rush_Code, Test.Result, Test.Test_Reason_Code, Test.Start_of_Testing, Test.End_of_Testing, Test.Batch_ID) VALUES (?,?,?,?,?,?,?);',
    [req.body.testCode, req.body.rushCode, req.body.result, req.body.testReasonCode, req.body.startTesting, req.body.endTesting, req.body.batchIDSelect], function(err, rows, fields){
        if(err){
            content.errorMsg = 'Insert Failed.  Please try again';
			res.render('insertTest', content);
			return;
        }
        mysql.pool.query('SELECT * FROM `Test`;',
        function(err, rows, fields){
            if(err){
                next(err);
                return;
            }
        mysql.pool.query('SELECT Batch.Batch_ID FROM `Batch`;',
        function(err, inputRow, fields){
            if(err){
                res.render('insertBatch', content);
                return;
            }
            let newRow = deleteDuplicates(inputRow);
            
            content.drop = newRow;

        content.header = Object.keys(rows[0]);
        content.results = rows;
        res.render('insertTest', content);
    });
});
});
});
app.get('/insertBatchTransaction', function(req,res){
    let  content = {};
    mysql.pool.query('SELECT Batch.Batch_ID FROM `Batch`;',
    function(err, rowsTwo, fields){
        if(err){
			res.render('insertBatchTransaction', content);
			return;
        }
    mysql.pool.query('SELECT Technician.Technician_ID FROM `Technician`;',
    function(err, rowsOne, fields){
        if(err){
			res.render('insertBatchTransaction', content);
			return;
        }
        
        let newRowOne = deleteDuplicates(rowsOne);
        
        content.dropOne = newRowOne;

        
        let newRowTwo = deleteDuplicates(rowsTwo);
        
        content.dropTwo = newRowTwo;

        res.render('insertBatchTransaction', content);
        });
    });
});
app.post('/insertBatchTransaction', function(req, res, next){
    let content = {};
    mysql.pool.query('INSERT INTO `Batch_Transaction` (Batch_Transaction.Technician_ID, Batch_Transaction.Batch_ID, Batch_Transaction.Batch_Status) VALUES (?,?,?);',
    [req.body.technicianIDSelect, req.body.batchID, req.body.check], function(err, rows, fields){
        if(err){            
            content.errorMsg = 'Insert Failed.  Please try again';
			res.render('insertBatchTransaction', content);
			return;
        }
        mysql.pool.query('SELECT * FROM `Batch_Transaction`;',
        function(err, rows, fields){
            if(err){
                next(err);
                return;
            }
        mysql.pool.query('SELECT Batch.Batch_ID FROM `Batch`;',
        function(err, rowsTwo, fields){
            if(err){
                res.render('insertBatchTransaction', content);
                return;
            }
        mysql.pool.query('SELECT Technician.Technician_ID FROM `Technician`;',
        function(err, rowsOne, fields){
            if(err){
                res.render('insertBatchTransaction', content);
                return;
            }
            
            let newRowOne = deleteDuplicates(rowsOne);
            
            content.dropOne = newRowOne;
    
            
            let newRowTwo = deleteDuplicates(rowsTwo);
            
            content.dropTwo = newRowTwo;

        content.header = Object.keys(rows[0]);
        content.results = rows;
        res.render('insertBatchTransaction', content);
    });
});
});
});
});
app.get('/insertInstrument', function(req,res){
    res.render('insertInstrument');
});
app.post('/insertInstrument', function(req, res, next){
    let content = {};
    mysql.pool.query('INSERT INTO `Instrument` (Instrument.Serial_Number, Instrument.Instrument_Name) VALUES (?,?);',
    [req.body.serialNumber, req.body.instrumentName], function(err, rows, fields){
        if(err){            
            content.errorMsg = 'Insert Failed.  Please try again';
			res.render('insertInstrument', content);
			return;
        }
        mysql.pool.query('SELECT * FROM `Instrument`;',
        function(err, rows, fields){
            if(err){
                next(err);
                return;
            }
        content.header = Object.keys(rows[0]);
        content.results = rows;
        res.render('insertInstrument', content);
    });
});
});
app.get('/insertTurnAround', function(req,res){
    res.render('insertTurnAround');
});
app.post('/insertTurnAround', function(req, res, next){
    let content = {};
    mysql.pool.query('INSERT INTO `Turn_Around_Time` (Turn_Around_Time.Test_Code, Turn_Around_Time.Rush_Code, Turn_Around_Time.Due_Date_Offset) VALUES (?,?,?);',
    [req.body.testCode, req.body.rushCode, req.body.dueDateOffset], function(err, rows, fields){
        if(err){            
            content.errorMsg = 'Insert Failed.  Please try again';
			res.render('insertTurnAround', content);
			return;
        }
        mysql.pool.query('SELECT * FROM `Turn_Around_Time`;',
        function(err, rows, fields){
            if(err){
                next(err);
                return;
            }
        content.header = Object.keys(rows[0]);
        content.results = rows;
        res.render('insertTurnAround', content);
    });
});
});
app.get('/insertSample', function(req,res){
    let  content = {};
    mysql.pool.query('SELECT COA.Report_ID FROM `COA`;',
    function(err, rowsTwo, fields){
        if(err){
			res.render('insertSample', content);
			return;
        }
    mysql.pool.query('SELECT Test.Test_ID FROM `Test`;',
    function(err, rowsOne, fields){
        if(err){
			res.render('insertSample', content);
			return;
        }
        
        let newRowOne = deleteDuplicates(rowsOne);
        
        content.dropOne = newRowOne;

        
        let newRowTwo = deleteDuplicates(rowsTwo);
        
        content.dropTwo = newRowTwo;

        res.render('insertSample', content);
        });
    });
});


app.post('/insertSample', function(req, res, next){
    let content = {};
    mysql.pool.query('INSERT INTO `Sample` (Sample.Report_ID, Sample.Received_Date, Sample.Test_ID) VALUES (?,?,?);',
    [req.body.reportIDSelect, req.body.receivedDate, req.body.testIDSelect], function(err, rows, fields){
        if(err){
			content.errorMsg = 'Insert Failed.  Please try again';
			res.render('insertSample', content);
            return;
        }
        mysql.pool.query('SELECT * FROM `Sample`;',
        function(err, rows, fields){
            if(err){
                next(err);
                return;
            }
        mysql.pool.query('SELECT COA.Report_ID FROM `COA`;',
        function(err, rowsTwo, fields){
            if(err){
                res.render('insertSample', content);
                return;
            }
        mysql.pool.query('SELECT Test.Test_ID FROM `Test`;',
        function(err, rowsOne, fields){
            if(err){
                res.render('insertSample', content);
                return;
            }
            
            let newRowOne = deleteDuplicates(rowsOne);
            content.dropOne = newRowOne;
    
            
            let newRowTwo = deleteDuplicates(rowsTwo);
            
            content.dropTwo = newRowTwo;

        content.header = Object.keys(rows[0]);
        content.results = rows;
        res.render('insertSample', content);
    });
});
});
});
});

function deleteDuplicates (rows){
    let set = new Set();
    for(let key in rows){
        if(rows.hasOwnProperty(key)){
        let obj = Object.keys(rows[key])[0];
        obj = (rows[key])[obj];
        set.add(obj);
        }
    }
    return Array.from(set).sort();

    ///////////////
    //Working code
    ///////////////
    // for(let key in rows) {
    // if(rows.hasOwnProperty(key)) {
    //     if (Object.values(rows[key])[0] !== null){
    //         set.add(Object.values(rows[key])[0]);
    //     }
    // }
}


/*
END INSERT STATEMENTS
*/

app.use(function(req,res){
    res.status(404);
    res.render('404');
  });
  
  app.use(function(err, req, res, next){
    console.error(err.stack);
    res.type('plain/text');
    res.status(500);
    res.render('500');
  });

app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});