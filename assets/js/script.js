$(document).ready(function () {
  var APIKey = "a518a026feaedaffc332be5dc7ca9090";

  var localCities = JSON.parse(localStorage.getItem("cities")) || [];
  displayAllCities();

  // display previously searched cities from localstorage
  function displayAllCities() {
    for (i = 0; i < localCities.length; i++) {
      // console.log(localCities[i]);
      $(".city-list").append(
        `<li><a href="#" id="prevCity" role="button" aria-pressed="true">${localCities[i]}</a></li>`
      );
    }
  }

  // clear cities on clear search click

  $(".remove").on("click", function () {
    localStorage.clear();
    $(".city-list").remove();
  });

  function displayWeather(event) {
    event.preventDefault();
    var searchCity = $("#searchCity");
    if (searchCity.val().trim() !== "") {
      city = searchCity.val().trim();
      getCurrentWeatherData(city);
      storeCity();
    }
  }
  function displayWeatherPrevCity(event) {
    event.preventDefault();
    var searchCity = $("#prevCity");
    console.log(searchCity);
    // if (searchCity.val().trim() !== "") {
    city = searchCity.val().trim();
    //console.log(city);
    getCurrentWeatherData(city);
    // }
  }
  function getCurrentWeatherData(city) {
    var queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${APIKey}`;

    cities = city.split(",");
    localCities.push(city);

    $.ajax({
      url: queryURL,
      method: "GET",
      datatype: "jsonp",
    }).then(function (response) {
      let widget = show(response);
      const lon = response.coord.lon;
      const lat = response.coord.lat;
      var uvIndexValue = uvIndexFunction(lat, lon);
      $(".showUvResults").html(uvIndexValue);
      $("#current-weather").html(widget);
      $("#search").val("");
    });

    getFiveDayForecast(city);
  }

  // UV index function and values classified by color warning
  function uvIndexFunction(lat, lon) {
    var queryURLData =
      "https://api.openweathermap.org/data/2.5/uvi?appid=" +
      APIKey +
      "&lat=" +
      lat +
      "&lon=" +
      lon;
    $.ajax({
      url: queryURLData,
      method: "GET",
    }).then(function (response) {
      let uvIndex = response.value;
      // console.log("UV: " + uvIndex);
      let $uvIndex = $("<button class= 'btn btnUvResults'>");
      $uvIndex.addClass("card-text uvIndex");
      $(".showUvResults").append($uvIndex);
      // UV index color coordinated warning
      if ((uvIndex > 0.01) & (uvIndex < 3)) {
        //color turn green
        $uvIndex
          .addClass("success-color")
          .css("background-color", "green")
          .text(`Low   + ${uvIndex}`);
      } else if ((uvIndex > 3) & (uvIndex < 6)) {
        // color turns yellow
        $uvIndex
          .addClass("yellow accent-1")
          .css("background-color", "yellow")
          .text(`Moderate to High   ${uvIndex}`);
      } else if ((uvIndex > 6) & (uvIndex < 8)) {
        // color turns orange
        $uvIndex
          .addClass("warning-color")
          .css("background-color", "orange")
          .text(`Moderate to High   ${uvIndex}`);
      } else if ((uvIndex > 8) & (uvIndex < 11)) {
        // color turns red
        $uvIndex
          .addClass("danger-color")
          .css("background-color", "red")
          .text(`Very High to Extreme   ${uvIndex}`);
      } else if (uvIndex > 11) {
        // color turns purple
        $uvIndex
          .addClass("secondary-color")
          .text(`UV Index: Very High to Extreme   ${uvIndex}`);
      } else {
        $uvIndex
          .addClass("notAvailable-color")
          .css("background-color", "blue")
          .text(`N/A`);
      }
      return uvIndex;
    });
  }

  function show(data) {
    // Offset UTC timezone - using moment.js
    let currentTimeUTC = data.dt;
    let currentTimeZoneOffset = data.timezone;
    let currentTimeZoneOffsetHours = currentTimeZoneOffset / 60 / 60;
    let currentMoment = moment
      .unix(currentTimeUTC)
      .utc()
      .utcOffset(currentTimeZoneOffsetHours);

    return `<div id='summary'>
      <h3 style= 'font-size: 20px; font-weight: bold;'>${
        data.name
      },${data.sys.country}     ${currentMoment.format("MM/DD/YYYY")}</h3>
      <h6><img src=https://openweathermap.org/img/wn/${
        data.weather[0].icon
      }.png> ${data.weather[0].description}</h6>
      <h6><strong>Weather</strong>: ${
        data.weather[0].main
      }</h6><h6><strong>Temperature</strong>: ${Math.floor(data.main.temp)}&deg;F</h6>
      <h6><strong>Min. Temp</strong>: ${Math.floor(
        data.main.temp_min
      )}&deg;F</h6><h6><strong>Max. Temp</strong>: ${Math.floor(data.main.temp_max)}&deg;F</h6>
      <h6><strong>Wind Speed</strong>: ${Math.floor(
        data.wind.speed
      )} MPH</h6><h6><strong>Humidity</strong>: ${data.main.humidity}%</h6>
      <h6 class='showUvResults'><strong>UV-Index</strong>: </h6></div>`;
  }

  function getFiveDayForecast(city) {
    var queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${APIKey}`;

    $.ajax({
      url: queryURL,
      method: "GET",
      datatype: "jsonp",
    }).then(function (response) {
      $("#showFiveDayForecast").html("");

      for (i = 0; i < response.list.length; i++) {
        if (response.list[i].dt_txt.indexOf("15:00:00") > 0) {
          var weatherData = response.list[i];
          let widgetFiveDay = showForecastData(weatherData);

          $("#showFiveDayForecast").append(widgetFiveDay);
        }
      }
    });
  }

  // five day forecast summary function pushed to HTML

  function showForecastData(data) {
    return `<div class='fiveDayFinal'> 
        <h6 class='dateFive'>${moment(data.dt_txt).format("LL")}</h6>
        <h6><img src=http://openweathermap.org/img/wn/${
          data.weather[0].icon
        }.png id='img2'> ${data.weather[0].description}</h6>
        <h6><strong>Weather</strong>: ${
          data.weather[0].main
        }</h6><h6><strong>Temperature</strong>: ${Math.floor(data.main.temp)}&deg;F</h6>
        <h6><strong>Wind Speed</strong>: ${Math.floor(
          data.wind.speed
        )} MPH</h6><h6><strong>Humidity</strong>: ${data.main.humidity}%</h6></div>`;
  }
  // store searched cities in local storage
  function storeCity() {
    localStorage.setItem("cities", JSON.stringify(localCities));
    let str = `<li><a href="#"  id="prevCity" role="button" aria-pressed="true">${cities}</a></li>`;
    $(".city-list").append(str);
  }
  // event handlers
  $("#searchButton").on("click", displayWeather);
  //$("#prevCity").on("click", displayWeatherPrevCity);
});
