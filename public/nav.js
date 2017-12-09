function blurBackground(){
	/*Adds gaussian blur to the background image. Cosmetically
	nice for emphasizing things like forms.*/
	var elmt = document.getElementById("background");
	if(!elmt.classList.contains("blur")){
		elmt.classList.add("blur");
	}
}


function populateNavigationMenu(){
    //use ajax to try and retrieve user login.    
    $.get("http://localhost:3000/users/current", function(data, status){
        if(data.user){
            console.log(data.user);
            //if the user is logged in, replace the link to login page with logout button            
            $("#logout").show();
            $("#login").hide();
        } else{
            //if the user is not logged in, add a link to login page
            $("#logout").hide()
            $("#login").show()            
        }
    }, "json");
    //button handler for destroying navbar
    $("#logout").click(function(){
        $.get("http://localhost:3000/devices/logout", function(data, status){}, "json");
    })   
    //add handler for destroying session to the logout button
}


$(document).ready(function(){
    populateNavigationMenu();        
});

