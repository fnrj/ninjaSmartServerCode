function forceRemove(){
    $.get("/users/current", function(data, status){
        if(data.user){
            //redirect to dashboard if the user is logged in 
            window.location.href = "/dashboard.html";            
        } 
    }, "json");
}

$(document).ready(function(){
    forceRemove();
});

