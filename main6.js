// modal and toggle with functions i know
// to seperate into small functions
// parallax
// canvas + progressbar
// abuot with picture
// sticky header
// bootstraping all


$(function () {

    $( document ).ajaxStart(function() {
        $( "#progressbar").show();
      });

      $(document).ajaxStop(function(){
        $( "#progressbar").hide();
      });

    // localStorage.clear();
    $("#aboutDiv, #liveDiv").hide();
    $("#home").css({"background-color" : "#2196F3", "color": "white"});
    $("#about, #live").css({"background-color" : "white", "color": "#2196F3"});
    
    $(async function () {
        try {
            const dataList = await getDataAsync("https://api.coingecko.com/api/v3/coins/list");
            printData(dataList);
        }
        catch (err) {
            alert("Error: " + err.status);
        }
    });

    function getDataAsync(url) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: url,
                success: data => resolve(data),
                reject: err => reject(err)
            });
        });
    }

    var topArr = []; 
    $("#home").click( function () {
        $("#home").css({"background-color" : "#2196F3", "color": "white"});
        $("#about, #live").css({"background-color" : "white", "color": "#2196F3"});
        $("#liveDiv, #aboutDiv").hide();
        $("#containerDiv").css({"left": "20%", "margin-top" : "5px"}).show();
        $(".data").show();
    });
    
    $("#live").click( function () {
        $("#live").css({"background-color" : "#2196F3", "color": "white"});
        $("#home, #about").css({"background-color" : "white", "color": "#2196F3"});
        $("#containerDiv, #aboutDiv").hide();
        $("#liveDiv").show();
        if (topArr.length !==0) {
            getFive();
        } else { // modal/text with "no favorites"
        }
    });
    $("#about").click( function () {
        $("#about").css({"background-color" : "#2196F3", "color": "white"});
        $("#home, #live").css({"background-color" : "white", "color": "#2196F3"});
        $("#containerDiv, #liveDiv").hide();
        $("#aboutDiv").show();
    });
    $("#searchButton").click(() => {
        const value = $("#searchInput").val();
        $("#liveDiv, #aboutDiv").hide();
        $("#containerDiv").css({"left": "39%", "margin-top" : "40px"}).show();
        $(".data").hide();
        $(`#${value}`).show() // css this to put in the middle?
        $("#searchInput").val("");
    });

    function printData(dataList) {
        // for (let i=0 ; i<100 ; i++) {
        for (coin of dataList) {
            if (coin.symbol.length === 3) {
                createCoin(coin, "#containerDiv");
                // $("#progressbar").hide(); here
            }
        }                        
    }
    
    function createCoin(coin, div) {
        const coinToPrint = $(`<div class="data" id="${coin.symbol}">
        <label class="switch">
            <input id="${coin.id}" name="${coin.name}" value="${coin.symbol}" type="checkbox">
            <span class="slider round"></span>
        </label>
        <h3>${coin.symbol}</h3>
        <p>${coin.name}</p>
        <button id="${coin.id}" class="collapsible ui-button ui-widget ui-corner-all" style="background-color:#2196F3;color:white"
            name="${coin.name}" value="${coin.symbol}">
            More Info
        </button>
        <div class="content">
            <p id="${coin.id}"></p>
        </div>
        </div>`);
        coinToPrint.find("input[type=checkbox]").on("click", function() {topFive(this)} );
        coinToPrint.find(".collapsible").on("click", function() {showMore(this)} );
        
        $(div).append(coinToPrint);
    }

    function showMore(more) {
        more.classList.toggle("active");
        const content = more.nextElementSibling; // to rewrite with the functions that i know
        if (content.style.display === "block") {
            content.style.display = "none";
            $(`button[id=${more.id}]`).text("More Info").css("position", "relative");
        } else {
            // $("#progressbar").css({"position" : "absolute", "top" : "90px", "width" : "5px", "left" : "550px"}).show();
            content.style.display = "block";
            // $(`button[id=${more.id}]`).text("Less Info")
            // $(`button[id=${more.id}]`).text("Less Info").css("position", "static");
            const coinString = sessionStorage.getItem(`${more.name}`);  
            if (coinString === null) {
                console.log(more.name + " is not on session storage");
                getMore(more.id);
                setTimeout ( ()=> {
                    sessionStorage.removeItem(`${more.name}`)
                }, 120000);
            } else {
                const coinObj = JSON.parse(coinString); 
                $(`p[id="${coinObj.id}"]`).html(
                    `<img src="${coinObj.img}"/><br/> 
                    Current exchange rate: ${coinObj.usd}$,
                    ${coinObj.eur}€,
                    ${coinObj.ils}₪`);                
                console.log("got it from session storages");
                console.log("more.id: " + more.id)
                $(`button[id=${more.id}]`).text("Less Info").css("position", "static");
            }
        }
    }
    
    async function getMore(id) {
        try {
            const coin = await getDataAsync(`https://api.coingecko.com/api/v3/coins/${id}`);
            printMore(coin);
        }
        catch (err) {
            alert("Error: " + err.status);
        }
    }
            
    function printMore(coin) {
        const coinMoreInfo = {    
            id: coin.id,
            img: coin.image.thumb,                      
            usd: coin.market_data.current_price.usd,
            eur: coin.market_data.current_price.eur,
            ils: coin.market_data.current_price.ils,
        };
        const coinToStore = JSON.stringify(coinMoreInfo); 
        sessionStorage.setItem(`${coin.name}`, coinToStore);    
        console.log("saved " + coin.name + " to session storage");
        console.log("coin id: " + coin.id);
        $(`p[id="${coin.id}"]`).html(
            `<img src="${coin.image.thumb}"/><br/> 
            Current exchange rate: ${coin.market_data.current_price.usd}$,
            ${coin.market_data.current_price.eur}&euro;,
            ${coin.market_data.current_price.ils}&#8362;`);
        // $("#progressbar").hide();
        // $(`button[id=${coin.id}]`).text("Less Info").css("position", "static"); here
    }

    function topFive(top) {
        const coinToPushOrHold = {
            symbol: top.value,
            name: top.name,
            id: top.id
        }
        if (top.checked === false) {
            for (let i=0; i<topArr.length ; i++) {
                if (topArr[i].id===top.id) {
                    topArr.splice(i,1);       // deletes this-"top"-object from array
                    console.log("topArr after splice: " + topArr);
                    $(`#containerDiv input[id=${top.id}]`).prop('checked', false).removeAttr('checked');
                }
            }
            const tempCoinString = sessionStorage.getItem("temporary"); 
            if (tempCoinString !== null) {
                const coinToAdd =JSON.parse(tempCoinString);
                $(`#containerDiv input[id=${coinToAdd.id}]`).prop('checked', true).attr('checked', 'checked');
                sessionStorage.removeItem("temporary");
                topArr.push(coinToAdd);
            }
            closeModal();
        } else if (topArr.length<5) {
            topArr.push(coinToPushOrHold);
            console.log("topArr: " + topArr);
            $(`#containerDiv input[id=${top.id}]`).prop('checked', true).attr('checked', 'checked');
        } else {
            const coinOnHold = JSON.stringify(coinToPushOrHold); 
            sessionStorage.setItem("temporary", coinOnHold); 
            // need to find a way not to use memory
            printToModal(top.name, top.value);
            openModal();
            top.checked = false;
        }
    }
    function openModal() {
        $("#myModal").css("display","block");
        $(".close, .closeButton").click( () => {
            closeModal();
        });
    }
    function closeModal() {
        $("#myModal").css("display", "none");
        $(".modal-content>.data").remove();
        sessionStorage.removeItem("temporary");
    }
    function printToModal(name, symbol) {
        $(".modal-content").html(`
        <span class="close">&times;</span>
        <p>We are very sorry, but there is an arbitrary limit of 5 coins to save as favorites.
            <br/>
            In order to add ${name} (${symbol}) to your favorites you have to remove one of the following: 
        </p>`);
        for (coin of topArr) {
            createCoin(coin, ".modal-content");
        }
        $(".modal-content").append(`<footer><button class="ui-button ui-widget ui-corner-all closeButton">
                Cancel
            </button></footer>`);
        $('.modal-content :checkbox').prop('checked', true).attr('checked', 'checked');
        $(".closeButton").css({"background-color" : "#2196F3", "color": "white", "position" : "relative", "margin-top" : "5px"});
    }
    var modal = document.getElementById("myModal");
    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
      }

      async function getFive() {
        let str = "";
        for (coin of topArr) {
            str+=`${coin.symbol},`;
        }
        console.log("str: " + str);
        // use reduce?
        const url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${str}&tsyms=USD`;
        try {
            const coin = await getDataAsync(url);
            console.log("got data")
            printFive(coin);
        }
        catch (err) {
            alert("Error: " + err.status);
        }
    }

    function printFive(topFiveUSD) {
        console.log(topFiveUSD);
        $("#liveDiv").empty();
        for (coin in topFiveUSD) {
            console.log("coin: " + coin);
            console.log("USD :" + topFiveUSD[coin].USD);
        }    
        drawChart();
    }
    
    // API here:
    // https://canvasjs.com/jquery-charts/dynamic-live-multi-series-chart/

    function drawChart() {

        var dataPoints1 = [];
        var dataPoints2 = [];
        var dataPoints3 = [];
        var dataPoints4 = [];
        var dataPoints5 = [];
        
        var options = {
            width: 800,
            title: {
                text: "Your selected cryptocurrencies rate in USD"
            },
            axisX: {
                title: "chart updates every 2 secs"
            },
            axisY: {
                suffix: "USD"
            },
            toolTip: {
                shared: true
            },
            legend: {
                cursor: "pointer",
                verticalAlign: "top",
                fontSize: 22,
                fontColor: "dimGrey",
                itemclick: toggleDataSeries
            },
            data: [{
                type: "line",
                xValueType: "dateTime",
                yValueFormatString: "###.00Wh",
                xValueFormatString: "hh:mm:ss TT",
                showInLegend: true,
                name: `${topArr[0].symbol}`,
                dataPoints: dataPoints1
            },
            {
                type: "line",
                xValueType: "dateTime",
                yValueFormatString: "###.00Wh",
                showInLegend: true,
                name: `${topArr[1].symbol}`,
                dataPoints: dataPoints2
            }, {
                type: "line",
                xValueType: "dateTime",
                yValueFormatString: "###.00Wh",
                showInLegend: true,
                name: `${topArr[2].symbol}`,
                dataPoints: dataPoints3
            }]
        };

        var chart = $("#liveDiv").CanvasJSChart(options);


        function toggleDataSeries(e) {
            if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                e.dataSeries.visible = false;
            }
            else {
                e.dataSeries.visible = true;
            }
            e.chart.render();
        }
        
        var updateInterval = 2000;
        // initial value
        var yValue1 = 800;
        var yValue2 = 810;
        var yValue3 = 780;
        
        var time = new Date;
        // starting at 10.00 am
        time.setHours(10);
        time.setMinutes(00);
        time.setSeconds(00);
        time.setMilliseconds(00);
        
        function updateChart(count) {
            count = count || 1;
            var deltaY1, deltaY2, deltaY3;
            for (var i = 0; i < count; i++) {
                time.setTime(time.getTime() + updateInterval);
                deltaY1 = -1 + Math.random() * (1 + 1);
                deltaY2 = -1 + Math.random() * (1 + 1);
                deltaY3 = -1 + Math.random() * (1 + 1);
        
                // adding random value and rounding it to two digits. 
                yValue1 = Math.round((yValue1 + deltaY1) * 100) / 100;
                yValue2 = Math.round((yValue2 + deltaY2) * 100) / 100;
                yValue3 = Math.round((yValue3 + deltaY3) * 100) / 100;
        
                // pushing the new values
                dataPoints1.push({
                    x: time.getTime(),
                    y: yValue1
                });
                dataPoints2.push({
                    x: time.getTime(),
                    y: yValue2
                });
                dataPoints3.push({
                    x: time.getTime(),
                    y: yValue3
                });
            }
        
            // updating legend text with  updated with y Value 
            options.data[0].legendText = `${topArr[0].symbol} : ${yValue1} USD`;
            options.data[1].legendText = `${topArr[1].symbol} : ${yValue2} USD`;
            options.data[2].legendText = `${topArr[2].symbol} : ${yValue3} USD`;
            $("#liveDiv").CanvasJSChart().render();
        }
        // generates first set of dataPoints 
        updateChart(100);
        setInterval(function () { updateChart() }, updateInterval);
        
        }
        // var options = {
        //     width: 800,
        //     exportEnabled: true,
        //     animationEnabled: true,
        //     title:{
        //         text: "Your selected cryptocurrencies rate in USD"
        //     },
        //     subtitles: [{
        //         text: "Click Legend to Hide or Unhide Data Series"
        //     }],
        //     axisX: {
        //         title: "seconds"
        //     },
        //     axisY: {
        //         title: "USD",
        //         titleFontColor: "#4F81BC",
        //         lineColor: "#4F81BC",
        //         labelFontColor: "#4F81BC",
        //         tickColor: "#4F81BC"
        //     },
        //     toolTip: {
        //         shared: true
        //     },
        //     legend: {
        //         cursor: "pointer",
        //         itemclick: toggleDataSeries
        //     },
        //     data: [{
        //         type: "spline",
        //         name: `${topArr[0].symbol}`,
        //         showInLegend: true,
        //         xValueFormatString: "MMM YYYY",
        //         yValueFormatString: "#,##0 Units",
        //         dataPoints: [
        //             { x: new Date(2016, 0, 1),  y: 120 },
        //             { x: new Date(2016, 1, 1), y: 135 },
        //             { x: new Date(2016, 2, 1), y: 144 },
        //             { x: new Date(2016, 3, 1),  y: 103 },
        //             { x: new Date(2016, 4, 1),  y: 93 },
        //             { x: new Date(2016, 5, 1),  y: 129 },
        //             { x: new Date(2016, 6, 1), y: 143 },
        //             { x: new Date(2016, 7, 1), y: 156 },
        //             { x: new Date(2016, 8, 1),  y: 122 },
        //             { x: new Date(2016, 9, 1),  y: 106 },
        //             { x: new Date(2016, 10, 1),  y: 137 },
        //             { x: new Date(2016, 11, 1), y: 142 }
        //         ]
        //     },
        //     {
        //         type: "spline",
        //         name: `${topArr[1].symbol}`,
        //         axisYType: "secondary",
        //         showInLegend: true,
        //         xValueFormatString: "MMM YYYY",
        //         yValueFormatString: "$#,##0.#",
        //         dataPoints: [
        //             { x: new Date(2016, 0, 1),  y: 19034.5 },
        //             { x: new Date(2016, 1, 1), y: 20015 },
        //             { x: new Date(2016, 2, 1), y: 27342 },
        //             { x: new Date(2016, 3, 1),  y: 20088 },
        //             { x: new Date(2016, 4, 1),  y: 20234 },
        //             { x: new Date(2016, 5, 1),  y: 29034 },
        //             { x: new Date(2016, 6, 1), y: 30487 },
        //             { x: new Date(2016, 7, 1), y: 32523 },
        //             { x: new Date(2016, 8, 1),  y: 20234 },
        //             { x: new Date(2016, 9, 1),  y: 27234 },
        //             { x: new Date(2016, 10, 1),  y: 33548 },
        //             { x: new Date(2016, 11, 1), y: 32534 }
        //         ]
        //     },
        // ]
        // };
        // $("#liveDiv").CanvasJSChart(options);
        // }

        // function toggleDataSeries(e) {
        //     if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
        //         e.dataSeries.visible = false;
        //     } else {
        //         e.dataSeries.visible = true;
        //     }
        //     e.chart.render();
        // }
        
        

});