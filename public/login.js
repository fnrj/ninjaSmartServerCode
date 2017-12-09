
function populateLoginForm(){
    	//hiding and showing divs for different panels
    $("#buttonLink").click(function(){
    	$(".toggle").slideToggle();
    });
    $("#registerLink").click(function(){
    	$(".toggle").slideToggle();
    });    
    //form validation methods (email and password) for new users
    $("#signup").submit(validateRegistration);    
    $("#signin").submit(verifyLogin);    
    
}

function verifyLogin(e){
    /* Checks out user credentials.
     * Response types:
     *    Valid - Submit normally
     *    Invalid - Invalid username or password
     *    Inactive - User needs to activate their account
     */
    var $user = $('#loginEmail').val()
    var $password = $('#loginPassword').val();
    var stop = true;
    
    $.ajax({url :'/users/' + $user + '/' + $password, 
            type : 'get',
            async: false,
            dataType: 'json',
            success: function(data){
                if(data.message == 'inactive'){
                    $('#invalidLogin').hide().slideUp('slow');                    
                    $('#inactive').show().slideDown('slow');                    
                } else if(data.message == 'invalid'){
                    $('#invalidLogin').show().slideDown('slow');
                    $('#invactive').hide().slideUp('slow');                                        
                }  else{
                    stop = false;
                }
            },
            error: function(xhr){
                console.log(xhr.responseText);
                stop = true;
           }
    });        
    if(stop){
        e.preventDefault();        
    }
}


function validateRegistration(e){
    /*
     * Basic form validation for email, device & password. Criteria are described below.
     *
     * Email: <anything>@<anything>.<anything>, with the restriction that '@' occurs only once. Must be unique.
     * Password: contains number(s), upper/lowercase chars, 12-14 characters
     * Device: Must be unique.
     */
    
	var emailPattern = /\S+@\S+\.\S+/ 
	var $email = $('#registerEmail').val();
	var $password = $('#registerPassword').val();
    var $device = $('#deviceId').val();
    
    errors = [];
    var emailError = '<li id=emailError>You must enter a valid email.</li>';
    var duplicateEmailError = '<li id=duplicateEmailError>That email has already been registered.</li>';
    var caseError = '<li id=caseError>Your password should have uppercase and lowercase letters.</li>';
    var lenError = '<li id=lenError>Your password should be 7-13 characters in length!</li>';
    var numError = '<li id=numError>Your password must contain characters and numbers.</li>';
    var deviceError = '<li id=deviceError>That device has already been registered.</li>';
	//email validation 
	var emailStatus = emailPattern.test($email) && ($email.lastIndexOf('@') == $email.indexOf('@'));

	//password validation
	var caseCheck = ($password != $password.toLowerCase());
	var lenCheck = $password.length > 6 && $password.length < 14;
	var numCheck = /\d/.test($password) && isNaN(parseFloat($password));
	var passwordStatus = caseCheck && lenCheck && numCheck;
    var deviceStatus;

    
    //display specific error components
    validationCheck(emailStatus, '#emailError', errors, emailError);
    validationCheck(caseCheck, '#caseError', errors, caseError);
    validationCheck(lenCheck, '#lenError', errors, lenError);
    validationCheck(numCheck, '#numError', errors, numError);
    
    //device validation (if one is entered).
    if($device.length > 0){
        //UPDATE THIS ROUTE TO REFLECT THE WEB SERVER!!!!        
        $.ajax({url :'/devices/' + $device, 
                type : 'get',
                async: false,
                dataType: 'json',
                success: function(data){
                    validationCheck(!data.registered, '#deviceError', errors, deviceError);
                    deviceStatus = !data.registered;
                },
                error: function(){
                    console.log('ajax failed (device query)!');
               }
        });  
    } else{
        validationCheck(true, '#deviceError', errors, deviceError); //for clearing out existing messages       
        deviceStatus = true; //device registration optional
    }
    
    //check to make sure user is not already registered.
    if(emailStatus){
        $.ajax({url :'/users/lookup/' + $email, 
                type : 'get',
                async: false,
                dataType: 'json',
                success: function(data){                    
                    validationCheck(!data.registered, '#duplicateEmailError', errors, duplicateEmailError);
                    emailStatus = emailStatus && !data.registered; 
                },
                error: function(){
                    console.log('ajax failed (user query)!');
                }
        });   
    }

    //only submit the form if everything is valid
	if(!(emailStatus && passwordStatus && deviceStatus)){    
        //slide down new errors
        for(var i = 0; i < errors.length; i++){
            $(errors[i]).hide().prependTo('#rErrorMessages').slideDown('fast');            
        }    
        console.log('.');
    } else{
        
        $.ajax({url :'/users/register',
                type : 'post',
                async: false,
                dataType: 'json',
                data: $('#signup').serialize(),
                success: function(res){
                    $(".toggle").hide();
                    $("#confirmation").show();
               },
                error: function(){
                    console.log('ajax submission failed (registration)!');
                }
        });           
    }
    return e.preventDefault(); //submit form with ajax
    
}

function validationCheck(status, id, errors, errorType){
    var isEmpty = $(id).length == 0;
    if(!status && isEmpty){
        errors.push(errorType);
    } else if(status && !isEmpty){
        $(id).remove();
    }
}


$(document).ready(function(){
    populateLoginForm(); 
});
