/*to do:
    - Make this look presentable
    - Add button for deleting a device
    - Add button for adding a device
    - Add kick for login page
*/

function checkLoggedIn(){
    /* Make sure that the user is logged in. Redirect to the log in page if they are not.*/
}

function populateDashboard(){
    // Query the user's devices. Session is stored on server side.
    $.get("http://localhost:3000/devices/profile", function(data, status){
    $("#userData").append("<ul>");
        for(var i=0; i < data.devices.length; i++){
            $("#userData").append("<li>" + data.devices[i] + "</li>");            
        }
    }, "json");
    $("#userData").append("</ul>");
}

$(document).ready(function(){
    //checkLoggedIn();
    populateDashboard();
});