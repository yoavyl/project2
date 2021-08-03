// modal and toggle with functions i know
// to seperate into small functions
// another progress  bar for more
// sticky header
// clean console.logs


$(function () {

    // Progress bar shows on ajax starts, and hides whrn ajaxs stops
    $( document ).ajaxStart(function() {
        $( "#progressbar").show();
      });

      $(document).ajaxStop(function(){
        $("#progressbar").hide();
      });

    // default home button status -> turned into a function since it happens on load AND when clicking home
    function buttonsHomeStatus() {
        $("#aboutDiv, #liveDiv").hide();
        $("#home").css({"background-color" : "#2196F3", "color": "white"});
        $("#about, #live").css({"background-color" : "white", "color": "#2196F3"});
    }

    // "on load"
    buttonsHomeStatus();
    
    // "on load" -> going to API to load cards
    $(async function () {
        try {
            const dataList = await getDataAsync("https://api.coingecko.com/api/v3/coins/");
            // instead of /list, which has a lot of dead weight
            printData(dataList);
        }
        catch (err) {
            alert("Error: " + err.status);
        }
    });

    // general "get data" function, for all APIs
    function getDataAsync(url) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: url,
                success: data => resolve(data),
                reject: err => reject(err)
            });
        });
    }

    let coinsToReportArrayMap = [{symbol: "xxx"},{symbol: "xxx"},{symbol: "xxx"},{symbol: "xxx"},{symbol: "xxx"}]; // a map of coinsToReportArray to use for the graph
    var coinsToReportArray = []; 

    // when clicking "home"
    $("#home").click( function () {
        clearInterval(intervalId);
        $( "#progressbar" ).progressbar( {disabled: false} );
        buttonsHomeStatus();
        $("#liveDiv").empty();
        // $("#homeDiv").css({"left": "20%", "margin-top" : "5px"}).show();
       $("#homeDiv").show();
        $(".data").show();
    });
    
    // when clicking "live reports"
    $("#live").click( function () {
        if (coinsToReportArray.length !==0) {    // if there is any coin to report
            // make this into a function that switches colors? more dynamic!
            $("#live").css({"background-color" : "#2196F3", "color": "white"});
            $("#home, #about").css({"background-color" : "white", "color": "#2196F3"});
            $("#homeDiv, #aboutDiv").hide();
            $("#liveDiv").empty().show();
            getFavoritesToReport();
        } else {                                // if there aren't any coins to report
            $("#modal-content").html(`
                <span class="close">&times;</span>
                <p>We are very sorry, but there are no favorite coins to report. Please hit Home button
                and select 1-5 coins.
                </p>`);
            openModal();
        }
    });

    // when clicking "about"
    $("#about").click( function () {
        clearInterval(intervalId);
        $("#about").css({"background-color" : "#2196F3", "color": "white"});
        $("#home, #live").css({"background-color" : "white", "color": "#2196F3"});
        $("#homeDiv, #liveDiv").hide();
        $("#liveDiv").empty();
        $("#aboutDiv").show();
    });

    // when clicking "enter" in search input = when clicking "search"
    $("#searchInput").keyup( function(event) {
        if (event.keyCode === 13) {
            $("#searchButton").click();
        }
    });

    // when clicking "search", taking into account in can be clicked when any of the three "tabs" is open
    $("#searchButton").click(() => {
        const value = $("#searchInput").val();
        if ( $(`#${value.toLowerCase()}`)[0] === undefined && value !== "") {           // modal opens when there is no match for search results
            $("#modal-content").html(`
                <span class="close">&times;</span>
                <p>No crypto is named "${value}", please search again with an exact expression.
                </p>`);
            openModal();
        } else if (value !== "") {                                                     // showing the result when there is a match (whether the search was lower / upper case)
            clearInterval(intervalId);
            $("#liveDiv, #aboutDiv").hide();
            // $("#homeDiv").css({"left": "39%", "margin-top" : "40px"}).show();
            $("#homeDiv").show();
            $(".data").hide();
            $("#liveDiv").empty();
            coinsToReportArrayMap = [];
            $(`#${value.toLowerCase()}`).show() // css this to put in the middle?
            $("#searchInput").val("");
        } else {                                                                       // modal opens when there is no input
            $("#modal-content").html(`
            <span class="close">&times;</span>
            <p>You didn't search anything...
            </p>`);
        openModal();
        }      
    });

    function printData(dataList) {
        for (coin of dataList) {
            createCoin(coin, "#containerDiv");
        }                        
    }
    
    function createCoin(coin, div) {                                                // function that prints the coin cards, both to "home" OR to modal 
        const coinToPrint = $(`<div class="data" id="${coin.symbol}">
        <div class="symbolToggle">
            <span class="cardSymbol text-uppercase">${coin.symbol}</span>
            <label class="switch">
                <input id="${coin.id}" name="${coin.name}" value="${coin.symbol}" type="checkbox">
                <span class="slider round"></span>
            </label>
        </div>
        <p>${coin.name}</p>
        <button id="${coin.id}" class="collapsible ui-button ui-widget ui-corner-all" style="background-color:#2196F3;color:white"
            name="${coin.name}" value="${coin.symbol}">
            More Info
        </button>
        <div class="content">
            <p id="${coin.id}"></p>
        </div>
        </div>`);
        coinToPrint.find("input[type=checkbox]").on("click", function() {favoriteCoinsToStore(this)} );
        coinToPrint.find(".collapsible").on("click", function() {showMoreInfo(this)} );
        
        $(div).append(coinToPrint);
    }

    function showMoreInfo(more) {
        more.classList.toggle("active");
        const content = more.nextElementSibling; // to rewrite with the functions that i know
        if (content.style.display === "block") {                        // closes the collapsible
            content.style.display = "none";
            $(`button[id=${more.id}]`).text("More Info").css("position", "relative");
        } else {                                                        // opens teh collapsible
            // $("#progressbar").css({"position" : "absolute", "top" : "90px", "width" : "5px", "left" : "550px"}).show();
            content.style.display = "block";
            $(`button[id=${more.id}]`).text("Less Info").css("position", "static");
            const coinString = sessionStorage.getItem(`${more.name}`);  
            if (coinString === null) {                                  // if the coin is not on storage -> go to API, print, and save in storage
                console.log(more.name + " is not on session storage");
                getMoreInfo(more.id);
            } else {                                                    // if the coin is on storage - retrieve it from storage
                const coinObj = JSON.parse(coinString); 
                // make it a function
                $(`p[id="${coinObj.id}"]`).html(
                    `<img src="${coinObj.img}"/>
                    Current exchange rate: ${coinObj.usd}$,
                    ${coinObj.eur}€,
                    ${coinObj.ils}₪`);                
                console.log("got it from session storages");
                console.log("more.id: " + more.id)
                $(`button[id=${more.id}]`).text("Less Info").css("position", "static");
            }
        }
    }
    
    async function getMoreInfo(id) {
        try {
            const coin = await getDataAsync(`https://api.coingecko.com/api/v3/coins/${id}`);
            printMoreInfo(coin);
        }
        catch (err) {
            alert("Error: " + err.status);
        }
    }
            
    function printMoreInfo(coin) {
        const coinMoreInfo = {    
            id: coin.id,
            img: coin.image.thumb,                      
            usd: coin.market_data.current_price.usd,
            eur: coin.market_data.current_price.eur,
            ils: coin.market_data.current_price.ils,
        };
        
        $(`p[id="${coin.id}"]`).html(                           // prints more info
            `<img src="${coin.image.thumb}"/>
            Current exchange rate: ${coin.market_data.current_price.usd}$,
            ${coin.market_data.current_price.eur}&euro;,
            ${coin.market_data.current_price.ils}&#8362;`);
        const coinToStore = JSON.stringify(coinMoreInfo); 
        sessionStorage.setItem(`${coin.name}`, coinToStore);    // save more infor in storage
        console.log("saved " + coin.name + " to session storage");
        setTimeout ( ()=> {
            sessionStorage.removeItem(`${coin.name}`)
        }, 120000);                                         // automatically deletes the storage after 2 minutes
    }

    function favoriteCoinsToStore(favorite) {
        const coinToPushOrHold = {
            symbol: favorite.value,
            name: favorite.name,
            id: favorite.id
        }
        if (favorite.checked === false) {                        // when removing selection on toggle -> to reduce the coin form the "database"
            for (let i=0; i<coinsToReportArray.length ; i++) {
                if (coinsToReportArray[i].id===favorite.id) {
                    coinsToReportArray.splice(i,1);       // deletes this favorite coin from array
                    console.log("coinsToReportArray after splice: " + coinsToReportArray);
                    $(`#containerDiv input[id=${favorite.id}]`).prop('checked', false).removeAttr('checked');
                }
            }
            const tempCoinString = sessionStorage.getItem("temporary");    // if it was on modal and the user wanted to save a sitxh coin -> switching between the coins
            if (tempCoinString !== null) {
                const coinToAdd =JSON.parse(tempCoinString);
                $(`#containerDiv input[id=${coinToAdd.id}]`).prop('checked', true).attr('checked', 'checked');
                sessionStorage.removeItem("temporary");
                coinsToReportArray.push(coinToAdd);
            }
            closeModal();
        } else if (coinsToReportArray.length<5) {         // when selecting coin # 1 to 5 -> saving it in "database"
            coinsToReportArray.push(coinToPushOrHold);
            console.log("coinsToReportArray: " + coinsToReportArray);
            $(`#containerDiv input[id=${favorite.id}]`).prop('checked', true).attr('checked', 'checked');
        } else {                                          // when selecting 6th coin -> open modal with favorite coins list and allowing removal and switching
            const coinOnHold = JSON.stringify(coinToPushOrHold); 
            sessionStorage.setItem("temporary", coinOnHold); 
            // need to find a way not to use memory
            printToModal(favorite.name, favorite.value);
            openModal();
            favorite.checked = false;
        }
    }

    function openModal() {                              // general functions to open the modal
        $("#myModal").css("display","block");
        $(".close, .closeButton").click( () => {
            closeModal();
        });
    }

    function closeModal() {                             // general function to close the modal
        $("#myModal").css("display", "none");
        $("#modal-content>.data").remove();
        sessionStorage.removeItem("temporary");
    }

    function printToModal(name, symbol) {               // printing modal with a list of 5 coins
        $("#modal-content").html(`
        <span class="close">&times;</span>
        <p>We are very sorry, but there is an arbitrary limit of 5 coins to save as favorites.
            <br/>
            In order to add ${name} (${symbol}) to your favorites you have to remove one of the following: 
        </p><br/>`);
        for (coin of coinsToReportArray) {
            createCoin(coin, "#modal-content");
        }
        $("#modal-content").append(`<footer><button class="ui-button ui-widget ui-corner-all closeButton">
                Cancel
            </button></footer>`);
        $('#modal-content :checkbox').prop('checked', true).attr('checked', 'checked');
        $(".closeButton").css({"background-color" : "#2196F3", "color": "white", "position" : "relative", "margin-top" : "5px"});
    }

    var modal = document.getElementById("myModal");
    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
      }



    let str ="";
    var intervalId;

    function getFavoritesToReport() {               // creates string to get the API of the favorite coins
        $("#liveDiv").empty();
        str = "";
        for (coin of coinsToReportArray) {
            str+=`${coin.symbol},`;
        }
        getGraph();
        $( "#progressbar" ).progressbar( {disabled: true} );
        intervalId = setInterval( ()=> {           // gets data and later "reprints" the graph every two seconds
            getGraph();
        }, 2000);
    }

    async function getGraph() {
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

    // creates the "database" for the graph
    let referenceArray;
    function printFive(favoriteCoinsUSD) {
        referenceArray = [];
        console.log(favoriteCoinsUSD);
        for (coin in favoriteCoinsUSD) {
            console.log("coin: " + coin);
            console.log("USD :" + favoriteCoinsUSD[coin].USD);  // if not undefined!!!
            referenceArray.push({usd: favoriteCoinsUSD[coin].USD});
        }
        console.log("coinsToReportArray length: " + coinsToReportArray.length);
        for (let i=coinsToReportArray.length ; i<5 ; i++) {
            // console.log(i)
            referenceArray.push({usd: 0});
        }
        drawChart();
        // $("#progressbar").progressbar( "destroy" );                 // hides progressbar before further updates of chart

    }
    
    let visibilityGraph =[]  
    let widthGraph;

    var iPhone = window.matchMedia("(max-width: 450px)");
    // iPhoneFunction(iPhone) // Call listener function at run time
    // iPhone.addListener(iPhoneFunction) // Attach listener function on state changes

    var iPad = window.matchMedia("(max-width: 800px)")
    
    function iPhoneFunction(iPhone) {
        if (iPhone.matches) { // If media query matches
          widthGraph = 300;
        } else if (iPad.matches) {
            widthGraph = 700;
        } else {
          widthGraph = 1140;
        }
      }

    // API here:
    // https://canvasjs.com/jquery-charts/dynamic-live-multi-series-chart/
    // MUST SPLICE coinsToReportArrayMAP BACK WHEN WE LEAVE LIVE REPORT

    function drawChart() {
        visibilityGraph = [];
        for (i=0; i<coinsToReportArray.length; i++) {
            coinsToReportArrayMap[i].symbol = coinsToReportArray[i].symbol;
        }
        let x = {symbol: "xxx"};
        for (i=1; i<=5; i++) {
            if (i<=coinsToReportArray.length) {
                visibilityGraph.push({visibility: true, showInLegend: true})
            } else {
                visibilityGraph.push({visibility: false, showInLegend: false});
                coinsToReportArrayMap.push(x);
            }
        }

        var dataPoints1 = [];
        var dataPoints2 = [];
        var dataPoints3 = [];
        var dataPoints4 = [];
        var dataPoints5 = [];
        
        var options = {
            width: widthGraph,
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
                shared: false // affects the index at the bottom
                // format with content formatter https://canvasjs.com/docs/charts/chart-options/tooltip/content-formatter/
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
                name: `${coinsToReportArrayMap[0].symbol}`,
                dataPoints: dataPoints1,
                visible: visibilityGraph[0].visibility,
                showInLegend: visibilityGraph[0].showInLegend
            },
            {
                type: "line",
                xValueType: "dateTime",
                yValueFormatString: "###.00Wh",
                showInLegend: true,
                name: `${coinsToReportArrayMap[1].symbol}`,
                dataPoints: dataPoints2,
                visible: visibilityGraph[1].visibility,
                showInLegend: visibilityGraph[1].showInLegend
            }, {
                type: "line",
                xValueType: "dateTime",
                yValueFormatString: "###.00Wh",
                showInLegend: true,
                name: `${coinsToReportArrayMap[2].symbol}`,
                dataPoints: dataPoints3,
                visible: visibilityGraph[2].visibility,
                showInLegend: visibilityGraph[2].showInLegend
            },
            {
                type: "line",
                xValueType: "dateTime",
                yValueFormatString: "###.00Wh",
                showInLegend: true,
                name: `${coinsToReportArrayMap[3].symbol}`,
                dataPoints: dataPoints4,
                visible: visibilityGraph[3].visibility,
                showInLegend: visibilityGraph[3].showInLegend
            },
            {
                type: "line",
                xValueType: "dateTime",
                yValueFormatString: "###.00Wh",
                showInLegend: true,
                name: `${coinsToReportArrayMap[4].symbol}`,
                dataPoints: dataPoints5,
                visible: visibilityGraph[4].visibility,
                showInLegend: visibilityGraph[4].showInLegend
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
         
        var yValue1 = referenceArray[0].usd;     
        var yValue2 = referenceArray[1].usd;
        var yValue3 = referenceArray[2].usd; 
        var yValue4 = referenceArray[3].usd;
        var yValue5 = referenceArray[4].usd;
        
        var time = new Date;

        function updateChart(count) {
            count = count || 1;
            for (var i = 0; i < count; i++) {
                time.setTime(time.getTime() + updateInterval);
                
                // here i insert the new values
                yValue1 = referenceArray[0].usd;     
                yValue4 = referenceArray[3].usd;
                yValue2 = referenceArray[1].usd;
                yValue3 = referenceArray[2].usd; 
                yValue5 = referenceArray[4].usd;

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
                dataPoints4.push({
                    x: time.getTime(),
                    y: yValue4
                });
                dataPoints5.push({
                    x: time.getTime(),
                    y: yValue5
                });
            }
        
            // updating legend text with  updated with y Value 
            options.data[0].legendText = `${coinsToReportArrayMap[0].symbol.toUpperCase()} : ${yValue1} USD`;
            options.data[1].legendText = `${coinsToReportArrayMap[1].symbol.toUpperCase()} : ${yValue2} USD`;
            options.data[2].legendText = `${coinsToReportArrayMap[2].symbol.toUpperCase()} : ${yValue3} USD`;
            options.data[3].legendText = `${coinsToReportArrayMap[3].symbol.toUpperCase()} : ${yValue4} USD`;
            options.data[4].legendText = `${coinsToReportArrayMap[4].symbol.toUpperCase()} : ${yValue5} USD`;
            $("#liveDiv").CanvasJSChart().render();
        }
        // generates first set of dataPoints 
        updateChart(100);
        setInterval(function () { updateChart() }, updateInterval);     
        }
    });