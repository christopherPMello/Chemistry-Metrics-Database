/*********************************************************************
** Program name: CS340 - Project Website
** Author: Scott Edwardsen and Chris Mello
** Date: 3/19/2019
** Description: Technician Page - Create and Delete
*********************************************************************/



//add a record to the table
function addRecord() {
	
	event.preventDefault();
	
	var newTech = document.getElementById("newTechnician");
	
	
	if(newTech.elements.firstnameInput.value.length === 0 || newTech.elements.lastnameInput.value.length === 0 )
	{
		window.alert("User didn't enter any data");
	}
	else {
		  
		  //stackoverflow.com/questions/9713058/send-post-data-using-xmlhttprequest
		var http = new XMLHttpRequest(),
		method = 'POST',
		url = '/tech';
		
		//build the url
		var usersInput = "type=insert&First_Name="+newTech.elements.firstnameInput.value+    
							"&Last_Name="+newTech.elements.lastnameInput.value;
			
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
					
					//add the new row to the table
					
					
					var response = JSON.parse(http.responseText);            
			
					//without the sleep function, id is undefined
					var id = response.rowID;

					var table = document.getElementById("technicianTable"); 

					//-1 add record at the end of the table
					var row = table.insertRow(-1);                         

					var newTechID = document.createElement('td');                
					newTechID.textContent = id;
					row.appendChild(newTechID);

					var newFirstName = document.createElement('td');                
					newFirstName.textContent = newTechnician.elements.firstnameInput.value;
					row.appendChild(newFirstName);
					newTechnician.elements.firstnameInput.value = "";

					var newLastName = document.createElement('td');                
					newLastName.textContent = newTechnician.elements.lastnameInput.value;
					row.appendChild(newLastName);
					newTechnician.elements.lastnameInput.value = "";
					 
					var newWorkoutDeleteCell = document.createElement('td');             
					var newWorkoutDeleteBtn = document.createElement('input');            
					newWorkoutDeleteBtn.setAttribute('type','button');
					newWorkoutDeleteBtn.setAttribute('name','deleteButtonValue');         
					newWorkoutDeleteBtn.setAttribute('value','Delete');
					newWorkoutDeleteBtn.setAttribute('onClick', 'deleteRecord(' + id + ')');
					var deleteRowID = document.createElement('input');             
					deleteRowID.setAttribute('type','hidden');
					deleteRowID.setAttribute('id', 'identifer' + id);
					newWorkoutDeleteCell.appendChild(deleteRowID);
					newWorkoutDeleteCell.appendChild(newWorkoutDeleteBtn);         
					row.appendChild(newWorkoutDeleteCell);  

					var x = document.getElementById("technicianTable").rows.length;
					
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
	
	var technicianTable = document.getElementById("technicianTable");
	
	var tableLength = technicianTable.rows.length;
	
	//remove the record from the webpage
	for(var x = 0; x < tableLength;x++){
			
		if("ID" !== document.getElementById("technicianTable").rows[x].cells[0].innerHTML) {
				if(x !== document.getElementById("technicianTable").rows[x].cells[0].innerHTML) {
					tableLength++;
				}
				
				if(document.getElementById("technicianTable").rows[x].cells[0].innerHTML == identifer) {
					technicianTable.deleteRow(x);
					x = tableLength;
			}
		}
	}
	
	//remove the record from the database
	event.preventDefault();
	
	//stackoverflow.com/questions/9713058/send-post-data-using-xmlhttprequest
	var http = new XMLHttpRequest();
	
	var url = '/tech';
		
	var usersInput = "type=delete&id="+identifer;
	
	http.open('POST', url, true);
	
	//Send the proper header information along with the request
	http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	
	http.send(usersInput);
}