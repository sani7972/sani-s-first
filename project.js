const OPENWEATHER_KEY = "d54b108e96c80d6717d844eba8dad9a6";
const OPENUV_KEY = "openuv-2ffmdrmfwp8jeo-io"; 
const URL = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

const searchBox = document.getElementById("city");
const searchBtn = document.getElementById("btn");

function calculateDewPoint(tempC, humidity) {
    const a = 17.27;
    const b = 237.7;
    const alpha = (a * tempC) / (b + tempC) + Math.log(humidity / 100);
    const dewPoint = (b * alpha) / (a - alpha);
    return Math.round(dewPoint * 10) / 10;
}

async function checkWeather(city = 'pune'){
    const res = await fetch(URL + city + `&appid=${OPENWEATHER_KEY}`);
    let data = await res.json();

    if (data.cod != 200) {
        document.querySelector(".city").innerHTML = "City not found!";
        return;
    }
    let temp =  Math.floor(data.main.temp);
    document.querySelector(".city").innerHTML = data.name;
    document.querySelector(".temp").innerHTML = temp + "°c";
    document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
    document.querySelector(".wind").innerHTML = data.wind.speed + " Km/h";
    document.querySelector(".pressure").innerHTML = data.main.pressure + " hPa";

    if(temp >0 && temp<10){
        document.querySelector(".condition").innerHTML = "Cold";
    }else  if(temp >10 && temp<20){
        document.querySelector(".condition").innerHTML = "Mild";
    }else  if(temp >20 && temp<30){
        document.querySelector(".condition").innerHTML = "Warm";
    }else  if(temp >30){
        document.querySelector(".condition").innerHTML = "Hot";
    }




    let precipitation = 0;
    if (data.rain && data.rain['1h']) {
        precipitation = data.rain['1h'];
    } else if (data.snow && data.snow['1h']) {
        precipitation = data.snow['1h'];
    }
    document.querySelector(".precipitation").innerHTML = `${precipitation} mm`;

    const lat = data.coord.lat;
    const lon = data.coord.lon;

    // --- Air Pollution (AQI) ---
    const airPollutionUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_KEY}`;
    const airResponse = await fetch(airPollutionUrl);
    const airData = await airResponse.json();
    const aqi = airData.list?.[0]?.main?.aqi || 0;

    let aqiText = 'Unknown';
    switch (aqi) {
        case 1: aqiText = 'Good'; break;
        case 2: aqiText = 'Fair'; break;
        case 3: aqiText = 'Moderate'; break;
        case 4: aqiText = 'Poor'; break;
        case 5: aqiText = 'Very Poor'; break;
    }
    document.querySelector(".aqi").innerHTML = aqiText;

    const dewPoint = calculateDewPoint(data.main.temp, data.main.humidity);
    document.querySelector(".dewpoint").innerHTML = `${dewPoint}°c`;

    try {
        const uvRes = await fetch(`https://api.openuv.io/api/v1/uv?lat=${lat}&lng=${lon}`, {
            headers: {
                "x-access-token": OPENUV_KEY
            }
        });
        const uvData = await uvRes.json();
        const uvIndex = uvData.result?.uv ?? "N/A";
        document.querySelector(".uv").innerHTML = uvIndex;
    } catch (err) {
        console.error("UV fetch error:", err);
        document.querySelector(".uv").innerHTML = "N/A";
    }
}

searchBtn.addEventListener("click", () => {
    checkWeather(searchBox.value);
});
searchBox.addEventListener("keyup", (e) => {
    if (e.key == "Enter") {
        checkWeather(searchBox.value);
    }
});
checkWeather();

function showTime() {
    let date = new Date();
    let hours = date.getHours();  
    let minutes = date.getMinutes(); 
    let session = "AM";
 
    if (hours == 0) {
      hours = 12;
    }
    
    if (hours > 12) {
      hours = hours - 12;
      session = "PM";
    }
   
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    
    let time = hours + ":" + minutes + " " + session;
 
    document.getElementById("clock").innerText = time;

    setInterval(showTime, 1000);
  }

  showTime();
