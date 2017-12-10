/*to do:
    - Make this look presentable
    - Add button for deleting a device
    - Add button for adding a device
    - Add kick for login page
*/



function configureTestButtons(){
    $("#generateButton").click(retrieveAPIKey);
    $("#generateButton").click(function(){
        $("#keySlot").slideDown("fast");
    });
    $("#testButton").click(verifyAPIKey);
    $("#testButton").click(function(){
        $("#keyTest").slideDown("fast");
    });    
    $("#zipButton").click(runZipTest);
    $("#zipButton").click(function(){
        $("#zipTest").slideDown("fast");
    });        
    $("#coordButton").click(runCoordTest);    
    $("#coordButton").click(function(){
        $("#coordTest").slideDown("fast");
    });        
}


function retrieveAPIKey(){
    /*Create an API key*/
    if( $("#keySlot").css('display') != 'none' ){
        return;
    }
    
    $.ajax({ url: '/externalusers/registerKey',
            type: 'post',
            dataType: 'json', 
            success: function(data){
                $("#keySlot").append(data.apikey);
            },
            error: function(xhr){
                $("#keySlot").text("Request failed.");
            }
    })    
}

function verifyAPIKey(){
    /* Check if an API key is valid */
    var apikey = $("#potentialKey").val();
    $.ajax({
        url:'/externalusers/verify',
        type: 'post',
        data: {'apikey' : $("#potentialKey").val()},
        dataType: 'json',
        success: function(data){
            if(data.valid){
                $("#keyTest").text("Your API key is valid and in our database.");                                
            } else{
                $("#keyTest").text("We don't have that API key on file.");                                                
            }
        },
        error: function(xhr){
            $("#keyTest").text("We can't reach our databases. Sorry about that!");
        }
    })
}



function runQuery(queryObject){
    /* Run sample queries using the user api key */
    $.ajax({
        url: queryObject.query,
        type: 'get',
        dataType: 'json',
        success: function(data){
            if(data.hasOwnProperty("averageUV")){
                $(queryObject.destId).text('Average UV exposure response: ' + data.averageUV);
            }else{
                $(queryObject.destId).text(data.message);                
            }
        },
        error: function(xhr){
            $(queryObject.destId).text("That query is invalid.");
        }
    })
}

function runZipTest(){
    runQuery({"query":$("#zipQuery").val(),"destId":"#zipTest"})
}

function runCoordTest(){
    runQuery({"query":$("#coordQuery").val(),"destId":"#coordTest"})
}

$(document).ready(function(){
    configureTestButtons();
});


             