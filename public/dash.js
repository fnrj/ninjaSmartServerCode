/*to do:
    - Make this look presentable
    - Add button for deleting a device
    - Add button for adding a device
    - Add kick for login page
*/


function extractUV(weatherData){
    uvIndexes = [];

    console.log(weatherData.data);
    for(var i=0; i < weatherData.data.length; i++){
        uvIndexes.push(weatherData.data[i].uv);
    }
    console.log(uvIndexes);
    if(Math.max.apply(null, uvIndexes) >= 6){
        $('#warnOut').show();
    }    
    console.log(Math.max.apply(null, uvIndexes));
    return uvIndexes;
}


function retrieveWeather(isZipCode){
    /*
     * Creates a weather graph. If isZipCode is enabled, plots in blue from the Photon.
     * Otherwise, plots in purple using the latitude and longitude of the Photon.
     */
    // Retrieve weather data for weatherbit
    var apikey = '&key=52643b0bc4584b828b5adfaf488c5013';
    var endpoint = 'https://api.weatherbit.io/v2.0/forecast/3hourly?';
    var title, insertLoc, color;
    
    $.ajax({url :'/users/devices',
        type : 'get',
        async: false,
        dataType: 'json',
        success: function(data){
            if(isZipCode){ //query by zip code
                endpoint = endpoint + '&postal_code=' + data.devices.zipCode + '&country=US' +apikey;
                title = '5 day forecast for zip code: ' + data.devices.zipCode;
                insertLoc = $('#uvGraphZip');
                color = "#3e95cd"
                
            } else{ //query by latitude and longitude
                endpoint = endpoint + '&lat=' + data.devices.latitude + '&lon=' + data.devices.longitude + apikey;
                title = '5 day forecast for latitude: ' + data.devices.latitude + ' longitude: ' + data.devices.longitude; 
                insertLoc = $('#uvGraphLat');     
                color = "#8e5ea2"
            }
            //retrieve the data from the weather api and add it the weather block
            $.get(endpoint, function(weatherData, status){
                new Chart(insertLoc, {
                    type: 'line',
                    data: {
                        labels: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
                        datasets: [{ 
                            data: extractUV(weatherData),
                            borderColor: color,
                            fill: true 
                        }]
                    },
                    options: {
                        responsive: false,                        
                        title: {
                            display: true,
                            text: title
                        },   
                        legend: {
                            display: false
                        },                        
                        scales: {
                            yAxes: [{
                                scaleLabel: {
                                    display: true,
                                    labelString: 'UV Index'
                                }
                            }],
                            xAxes: [{
                                scaleLabel: {
                                    display: true,
                                    labelString: 'UV Predictions for Next 5 Days'
                                }
                            }]                            
                        }
                        
                    }
                });
            })
        },
        error: function(xhr){
            console.log(xhr.responseText);
        }
    });   
}


$(document).ready(function(){
    retrieveWeather(false);
    retrieveWeather(true);
});


