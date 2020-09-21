/*********************************************************************
** Program name: CS340 - Project Website
** Author: Scott Edwardsen and Chris Mello
** Date: 3/19/2019
** Description: Search Page - Search for value in COA table
*********************************************************************/




//add a record to the table
function searchRecord() {
	
	event.preventDefault();
	
	var newTech = document.getElementById("searchCOATable");
	
	
	var searchValue = newTech.elements.searchTextValue.value;
	
	
	//check to see if the user entered anything in the search
	if(newTech.elements.searchTextValue.value.length === 0 || !(document.getElementById("Report_ID").checked 
	|| document.getElementById("Customer_Name").checked 
	|| document.getElementById("Report_Status").checked 
	|| document.getElementById("COA_Send_Date").checked
	))
	{
		window.alert("Either the user didn't enter any data or they didn't select any check boxes");
	}
	else {
		  
		//stackoverflow.com/questions/9713058/send-post-data-using-xmlhttprequest
		var http = new XMLHttpRequest(),
		method = 'POST',
		url = '/lookup';
		
		//build the url
		var usersInput = [];
		
		
		//Build the where clause of the SQL query
		if(document.getElementById("Report_ID").checked) {
			usersInput.push("Report_ID like '%" +searchValue + "%'" );
		}
		
		if(document.getElementById("Customer_Name").checked) {
			usersInput.push("Customer_Name like '%" +searchValue + "%'" );
		}
		
		if(document.getElementById("Report_Status").checked) {
			usersInput.push("Report_Status like '%" +searchValue + "%'" );
		}
		
		if(document.getElementById("COA_Send_Date").checked) {
			usersInput.push("COA_Send_Date like '%" +searchValue + "%'" );
		}
		
		var arrayLength = usersInput.length;
		var sqlQuery = "SQL_Like_Clause=";
    
		//Add "Or" between each check box
		for (var i = 0; i < arrayLength; i++) {
			if (i === 0) {
				sqlQuery += usersInput[0];
			}
			else {
				sqlQuery += ("|| " + usersInput[i]);
			}
		}
		
		sqlQuery += ";";
			
		http.open(method, url, true);
		
		//Send the proper header information along with the request
		http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		
		function searchDatabase (callback) {
			
			http.onreadystatechange = () => callback();
			http.send(sqlQuery);	
			
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
					var id = response.results;
					

					
					
					var table = document.getElementById("searchTable"); 
					
					var userAlert = document.getElementById("userAlert"); 
					
					//clear the results
					userAlert.innerHTML = "";
					
					var rowCount = table.rows.length;
						for (var i = rowCount - 1; i >= 0; i--) {
							table.deleteRow(i);
						}
					
					//if there are results then display them
					if(id.length > 0) {
					
						var thead = document.createElement("thead");
						
						var tableHeader = document.createElement("tr");
							
						var header1 = document.createElement("th");
						header1.textContent = "Report ID";
						tableHeader.appendChild(header1);
						
						var header2 = document.createElement("th");
						header2.textContent = "Customer Name";
						tableHeader.appendChild(header2);
						
						var header3 = document.createElement("th");
						header3.textContent = "Report Status";
						tableHeader.appendChild(header3);
						
						var header4 = document.createElement("th");
						header4.textContent = "COA Send Date";
						tableHeader.appendChild(header4);
						
						thead.appendChild(tableHeader);
						table.appendChild(thead);
						
						for ( var i = 0; i < id.length; i++) {
							
							var row = document.createElement("tr");
							
							var obj = id[i];
						
							for (var key in obj) {
								
								
								var newCellData = document.createElement('td');                
								newCellData.textContent = obj[key];
								row.appendChild(newCellData);
							}
							table.appendChild(row);
						}
											
				} else {
					userAlert.innerHTML = "No Search Results Found";
				}
		
			}
		};
		}
		searchDatabase(callbackFunction);
	
	}
	
}

