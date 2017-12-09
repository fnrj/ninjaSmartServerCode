/*to do:
    - Make this look presentable
    - Add button for deleting a device
    - Add button for adding a device
    - Add kick for login page
*/



function retrieveWeather(){
    // Retrieve weather data using operweathermap. Sample query for Tucson 
    var apikey = 'cd21c8117d8d56151a87ce0a0d61c921';
    var lat = 32.2217;
    var lon = 110.9265;
    var cnt = 5;
    var start = 1498049953;
    var end = 1498481991;
    var endpoint = 'http://api.openweathermap.org/data/2.5/uvi?appid=' + apikey + '&lat=' + lat + '&lon=' + lon + '&cnt=' + cnt + '&start='+ start + '&end=' + end;
    
    $.get(endpoint, function(data, status){
        console.log(data);
    })
    

}

$(document).ready(function(){
    retrieveWeather();
    populateDashboard();
});