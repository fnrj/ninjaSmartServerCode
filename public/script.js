function blurBackground(){
	/*Adds gaussian blur to the background image. Cosmetically
	nice for emphasizing things like forms.*/
	var elmt = document.getElementById("background");
	if(!elmt.classList.contains("blur")){
		elmt.classList.add("blur");
	}
}


function validateRegistration(){
    /*
     * Basic form validation for email & password. Criteria are described below.
     *
     * Email: <anything>@<anything>.<anything>, with the restriction that '@' occurs only once.
     * Password: contains number(s), upper/lowercase chars, 12-14 characters
     */

	var emailPattern = /\S+@\S+\.\S+/ 
	var $email = $('#registerEmail').val();
	var $password = $('#registerPassword').val();
    		invalid = "#ffb380";

	//email validation 
	var emailStatus = emailPattern.test($email) && ($email.lastIndexOf('@') == $email.indexOf('@'));

	//password validation
	var caseCheck = ($password != $password.toLowerCase());
	var lenCheck = $password.length > 6 && $password.length < 14;
	var numCheck = /\d/.test($password);
	var passwordStatus = caseCheck && lenCheck && numCheck;

	//only submit the form if everything is valid
	if(!(emailStatus && passwordStatus)){
		alert('Invalid username or password. Alex will add handling here later.')
	}
}

$(document).ready(function(){
	//hiding and showing divs for different panels
    $("#buttonLink").click(function(){
    	$(".loginPanel").slideToggle();
    });
    $("#registerLink").click(function(){
    	$(".loginPanel").slideToggle();
    });

    //form validation methods (email and password) for new users
    $("#signup").submit(validateRegistration);
});

