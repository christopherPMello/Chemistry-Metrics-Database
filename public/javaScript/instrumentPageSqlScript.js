
/*********************************************************************
** Program name: CS340 - Project Website
** Author: Scott Edwardsen and Chris Mello
** Date: 3/19/2019
** Description: Instrument Page - Create and Delete
*********************************************************************/

//add a record to the table
function addRecord() {
	
	event.preventDefault();
	
	var newTech = document.getElementById("newInstrument");
	
	if(newTech.elements.Serial_Number.value.length === 0 || newTech.elements.Instrument_Name.value.length === 0 )
	{
		window.alert("User didn't enter any data");
	}
	else {
		  
		  //stackoverflow.com/questions/9713058/send-post-data-using-xmlhttprequest
		var http = new XMLHttpRequest(),
		method = 'POST',
		url = '/instrument';
		
		//build the url
		var usersInput = "type=insert&Serial_Number="+newTech.elements.Serial_Number.value+    
							"&Instrument_Name="+newTech.elements.Instrument_Name.value;
			
		http.open(method, url, true);
		
		//Send the proper header information along with the request
		http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		
		function updateDatabase (callback) {
			
			http.onreadystatechange = () => callback();
			http.send(usersInput);	
			
		}
		
		function callbackFunction () {	
			//developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState
			if(http.readyState == 4 && http.status == 200) {
				if(http.status >= 200 && http.status < 400){
		
					//added because callback isn't working correctly and isn't waiting until 
					//it receives a response with the rowID from Node.js/mySQL database
					//sleep(500);
					
					//add the new row to the table
					var response = JSON.parse(http.responseText);            
			
					//without the sleep function, id is undefined
					var id = response.rowID;

					var table = document.getElementById("instrumentTable"); 

					//-1 add record at the end of the table
					var row = table.insertRow(-1);                         

					var newSerialNumber = document.createElement('td');                
					newSerialNumber.textContent = newInstrument.elements.Serial_Number.value;
					row.appendChild(newSerialNumber);
					

					var newInstrumentName = document.createElement('td');                
					newInstrumentName.textContent = newInstrument.elements.Instrument_Name.value;
					row.appendChild(newInstrumentName);
					newInstrument.elements.Instrument_Name.value = "";
					 
					var newWorkoutDeleteCell = document.createElement('td');             
					var newWorkoutDeleteBtn = document.createElement('input');            
					newWorkoutDeleteBtn.setAttribute('type','button');
					newWorkoutDeleteBtn.setAttribute('name','deleteButtonValue');         
					newWorkoutDeleteBtn.setAttribute('value','Delete');
					newWorkoutDeleteBtn.setAttribute('onClick', 'deleteRecord(' + newInstrument.elements.Serial_Number.value + ')');
					var deleteRowID = document.createElement('input');             
					deleteRowID.setAttribute('type','hidden');
					deleteRowID.setAttribute('id', 'identifer' + id);
					newWorkoutDeleteCell.appendChild(deleteRowID);
					newWorkoutDeleteCell.appendChild(newWorkoutDeleteBtn);         
					row.appendChild(newWorkoutDeleteCell);                         
					
					newInstrument.elements.Serial_Number.value = "";
					
					var x = document.getElementById("instrumentTable").rows.length;
					
					if(x === 1) {
						location.reload();
					}
					
				}
		
			}
		};
		
		updateDatabase(callbackFunction);
	}
}


//delete a record
function deleteRecord(identifer) {
	
	var instrumentTable = document.getElementById("instrumentTable");
	
	var tableLength = instrumentTable.rows.length;
	
	//remove the record from the webpage
	for(var x = 0; x < tableLength;x++){
			
		if("ID" !== document.getElementById("instrumentTable").rows[x].cells[0].innerHTML) {
				if(x !== document.getElementById("instrumentTable").rows[x].cells[0].innerHTML) {
					tableLength++;
				}
				
				if(document.getElementById("instrumentTable").rows[x].cells[0].innerHTML == identifer) {
					instrumentTable.deleteRow(x);
					x = tableLength;
			}
		}
	}
	
	//remove the record from the database
	event.preventDefault();
	
	//stackoverflow.com/questions/9713058/send-post-data-using-xmlhttprequest
	var http = new XMLHttpRequest();
	
	var url = '/instrument';
		
	var usersInput = "type=delete&id="+identifer;
	
	http.open('POST', url, true);
	
	//Send the proper header information along with the request
	http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	
	http.send(usersInput);
}