function updateLogin(e){
    /*
     * Updates a users password via Ajax.
     */
    $.ajax({url :'/users/updatePassword',
            type : 'put',
            dataType: 'json',
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
            success: function(data){
                //add the objects in the devices array to the list 
                $('#userDevices').html('<h4>' + 'Device Id: '+data.devices[0].deviceId + '</h4>');
                $('#userDevices').append('<h4>' + 'Longitude: '+data.devices[0].longitude + '</h4>');
                $('#userDevices').append('<h4>' + 'Latitude: '+data.devices[0].latitude + '</h4>');
                $('#userDevices').append('<h4>' + 'Recent UV index: ' + '</h4>');
		for(var i = 0; i < data.devices.length; i++){
			var nowTime = new Date(data.devices[i].loggedTime); 
                    $('#userDevices').append('<p>' + data.devices[i].uv + '@' + nowTime +'</p>');                    
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


$(document).ready(function(){
    $('#changePass').submit(updateLogin);
    $('#addDevice').submit(addDevice);
    populateDevices();
});
