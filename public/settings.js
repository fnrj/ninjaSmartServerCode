function updateLogin(e){
    /*
     * Updates a users password via Ajax.
     */
    $.ajax({url :'http://localhost:3000/users/updatePassword',
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
    $.ajax({url: 'http://localhost:3000/users/devices',
            type: 'get',
            success: function(data){
                //add the objects in the devices array to the list 
                for(var i = 0; i < data.devices.length; i++){
                    $('#userDevices').append('<li>' + data.devices[i].deviceId + '</li>');                    
                }
            },
            error: function(xhr){
                console.log(xhr.responseText);
            }
    });
}

function addDevice(e){
    
    $.ajax({url :'http://localhost:3000/users/addDevice',
            type : 'post',
            dataType: 'json',
            data: $('#newDevice').serialize(),
            success: function(data){
                $('#userDevices').append('<li>' + data.deviceId + '</li>');                                    
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