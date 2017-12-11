function updateLogin(e){
    /*
     * Updates a users password via Ajax.
     */
    $.ajax({url :'/users/updatePassword',
            type : 'put',
            dataType: 'json',
	    headers: {'x-auth': window.localStorage.getItem("token")}, 
            data: $('#changePass').serialize(),
            success: function(res){
                console.log('Password updated.');
            },
            error: function(xhr){
                console.log(xhr.responseText);
            }
    });      
    e.preventDefault();
}

function populateDevices(){
    /*
     * Retrieves the devices associated with a user from the server and displays them on the page.
     */
    $.ajax({url: '/users/devices',
            type: 'get',
	    headers: {'x-auth': window.localStorage.getItem("token")}, 
            success: function(data){
                //add the objects in the devices array to the list
		if(data.devices.length===0){
			$('#userDevices').html('<h2>No data available now</h2>');
		} 
		else{
                $('#userDevices').html('<h4>' + 'Device Id: '+data.devices[0].deviceId + '</h4>');
                $('#userDevices').append('<h4>' + 'Longitude: '+data.devices[0].longitude + '</h4>');
                $('#userDevices').append('<h4>' + 'Latitude: '+data.devices[0].latitude + '</h4>');
                $('#userDevices').append('<h4>' + 'Recent UV index: ' + '</h4>');
		for(var i = 0; i < data.devices.length; i++){
			var nowTime = new Date(data.devices[i].loggedTime); 
                    $('#userDevices').append('<p>' + data.devices[i].uv + '@' + nowTime +'</p>');                    
                }
		}
            },
            error: function(xhr){
                console.log(xhr.responseText);
            }
    });
}

function addDevice(e){
     $.ajax({url :'/users/removeDevice',
            type : 'delete',
	    headers: {'x-auth': window.localStorage.getItem("token")}, 
            dataType: 'json',
            success: function(data){
            },
            error: function(xhr){
                console.log(xhr.responseText);
            }
    });      
    
    $.ajax({url :'/users/addDevice',
            type : 'post',
            dataType: 'json',
	    headers: {'x-auth': window.localStorage.getItem("token")}, 
            data: $('#newDevice').serialize(),
            success: function(data){
                $('#userDevices').html('<li>' + 'Device Id: ' + data.deviceId + '</li>');                                    
                $('#userDevices').append('<li>' + 'Device API key: ' + data.apikey + '</li>');                                    
            },
            error: function(xhr){
                console.log(xhr.responseText);
            }
    });     
    e.preventDefault();
}




function extractUV(weatherData){
    uvIndexes = [];

    console.log(weatherData.data);
    for(var i=0; i < weatherData.data.length; i++){
        uvIndexes.push(weatherData.data[i].uv);
    }
    console.log(uvIndexes);
    if(Math.max.apply(null, uvIndexes) >= 6){
        $('#warnOut').show();
    }    
    return uvIndexes;
}

function generateAxis(sampledata){
    var axArr = [];
    for(var i = 0; i < sampledata.length; i++){
        axArr.push('');
    }
    return axArr;
}



function displayUserGraph(){
    /*
     * Retrieve the graph associated with the current user's device. 
     *
     * MAKE SURE PROFILE CANNOT BE ACCESSED WITHOUT LOGIN 
     */
    //$.ajax({url: ''
    //       type: 'get', 
    //       datatype: 'json',
    //       success: 
    $.ajax({'url': '/users/usersession/graph/data',
            'type': 'get',
	    'headers': {'x-auth': window.localStorage.getItem("token")}, 
            'dataType': 'json',
	        'headers': {'x-auth': window.localStorage.getItem("token")},             
            'success': function(data){
                console.log('making chart');
                new Chart($('#graph'), {
                    type: 'line',
                    data: {
                        labels: generateAxis(data.uv),
                        datasets: [{ 
                            data: data.uv,
                            pointBackgroundColor: data.colors
                        }]
                    },
                    options: {
                        responsive: false,                        
                        title: {
                            display: true,
                            text: 'Your Photon\'s Recent UV Exposure'
                        },   
                        legend: {
                            display: false
                                      
                        },                        
                        scales: {
                            yAxes: [{
                                scaleLabel: {
                                    display: true,
                                    labelString: 'UV Index'
                                },
                                ticks: {
                                    beginAtZero: true,
                                    steps: 10,
                                    stepValue: 1,
                                    max: 10
                                }                                
                            }],
                            xAxes: [{
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Time'
                                }
                            }]                            
                        },
                        
                        onClick: function(e, activeElements) {
                            try{
                                
                                //update the color of the point on the visible display 
                                var colorArray = data.colors;
                                var colormap = ['white', 'green', 'blue', 'red'];
                                var elementIndex = activeElements[0]._index;
                                var color = colormap[(colormap.indexOf(this.data.datasets[0].pointBackgroundColor[elementIndex]) + 1) % 4];
                                colorArray[elementIndex] = color;
                                this.data.datasets[0].pointBackgroundColor[elementIndex] = color;                           
                                this.update();
                                          
                                //save it out with ajax
                                $.ajax({url :'/users/usersession/graph/colors',
                                    type : 'post',
                                    dataType: 'json',
	                                headers: {'x-auth': window.localStorage.getItem("token")}, 
                                    data: {'colors': colorArray},
                                    success: function(data){
                                        console.log(data);                                   
                                    },
                                    error: function(xhr){
                                        console.log(xhr.responseText);
                                    }
                                });    
                            } catch(err){
                                console.log('clicked off point.');
                            }
                        }                                                
                        
                    }
                });    
            }
    })
    
}

function forceRemove(){
    $.get("/users/current", function(data, status){
        if(!data.user){
            //redirect to home page
            window.location.href = "/index.html";            
        } else{
            createPage();
        }
    }, "json");
}

function createPage(){
    //create the page if user is logged in
    displayUserGraph();
    $('#changePass').submit(updateLogin);
    $('#addDevice').submit(addDevice);
    populateDevices();
}


$(document).ready(function(){
    forceRemove();
});
