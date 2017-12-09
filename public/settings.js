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


$(document).ready(function(){
    $('#changePass').submit(updateLogin);
});