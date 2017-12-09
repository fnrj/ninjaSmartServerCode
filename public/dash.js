/*to do:
    - Make this look presentable
    - Add button for deleting a device
    - Add button for adding a device
    - Add kick for login page
*/



function populateDashboard(){
    // Query the user's devices. Session is stored on server side.

    $.get("http://localhost:3000/users/profile", function(data, status){    
        console.log(data);
        $("#userData").append("<ul>");
        $("#userData").append("<li>" + data.devices[0] + "</li>");            
        $("#userData").append("<li>" + data.userEmail + "</li>");                    
        $("#userData").append("<li>" + data.password + "</li>");            
        $("#userData").append("</ul>");  
    }, "json")
    .fail(function(jqxhr) {
        window.location.href = "http://localhost:3000/login.html#";
    })   
    
}

$(document).ready(function(){
    populateDashboard();
});