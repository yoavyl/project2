// modal and toggle with functions i know
// to seperate into small functions
// parallax
// another progress  bar for more
// abuot with picture
// sticky header
// bootstraping all
// clean console.logs


$(function () {

    $( document ).ajaxStart(function() {
        $( "#progressbar").show();
      });

      $(document).ajaxStop(function(){
        $( "#progressbar").hide();
      });

    // localStorage.clear();

    function buttonsHomeStatus() {
        $("#aboutDiv, #liveDiv").hide();
        $("#home").css({"background-color" : "#2196F3", "color": "white"});
        $("#about, #live").css({"background-color" : "white", "color": "#2196F3"});
    }

    buttonsHomeStatus();
    
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

    function getDataAsync(url) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: url,
                success: data => resolve(data),
                reject: err => reject(err)
            });
        });
    }

    let topArrMap = [{symbol: "xxx"},{symbol: "xxx"},{symbol: "xxx"},{symbol: "xxx"},{symbol: "xxx"}];
    var topArr = []; 
    $("#home").click( function () {
        clearInterval(intervalId);
        $( "#progressbar" ).progressbar( {disabled: false} );
        buttonsHomeStatus();
        $("#liveDov").empty();
        $("#containerDiv").css({"left": "20%", "margin-top" : "5px"}).show();
        $(".data").show();
    });
    

    $("#live").click( function () {
        if (topArr.length !==0) {

            // make this into a function that switches colors? more dynamic!
            $("#live").css({"background-color" : "#2196F3", "color": "white"});
            $("#home, #about").css({"background-color" : "white", "color": "#2196F3"});
            $("#containerDiv, #aboutDiv").hide();
            $("#liveDiv").empty().show();
            getFive();
        } else { 
            $(".modal-content").html(`
                <span class="close">&times;</span>
                <p>We are very sorry, but there are no favorite coins to report. Please hit Home button
                and select 1-5 coins.
                </p>`);
            openModal();
        }
    });
    $("#about").click( function () {
        clearInterval(intervalId);
        $("#about").css({"background-color" : "#2196F3", "color": "white"});
        $("#home, #live").css({"background-color" : "white", "color": "#2196F3"});
        $("#containerDiv, #liveDiv").hide();
        $("#liveDov").empty();
        $("#aboutDiv").show();
    });

    $("#searchButton").click(() => {
        const value = $("#searchInput").val();
        if (bankArray.find(item => item == value) == undefined) {
            $(".modal-content").html(`
                <span class="close">&times;</span>
                <p>No crypto is named "${value}", please search again with the exact expression.
                </p>`);
            openModal();
        } else {
            clearInterval(intervalId);
            $("#liveDiv, #aboutDiv").hide();
            $("#containerDiv").css({"left": "39%", "margin-top" : "40px"}).show();
            $(".data").hide();
            $("#liveDov").empty();
            topArrMap = [];
            $(`#${value}`).show() // css this to put in the middle?
            $("#searchInput").val("");
        }        
    });

    const bankArray =[];
    function printData(dataList) {
        // for (let i=0 ; i<100 ; i++) {
        for (coin of dataList) {
            // if (coin.symbol.length === 3) {
                createCoin(coin, "#containerDiv");
                bankArray.push(coin.symbol); // need that for search
                // $("#progressbar").hide(); here
            // }
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
            $(`button[id=${more.id}]`).text("Less Info").css("position", "static");
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
        // make this into function
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

    let str ="";
    var intervalId;

    function getFive() {
        $("#liveDiv").empty();
        str = "";
        for (coin of topArr) {
            str+=`${coin.symbol},`;
        }
        getGraph();
        $( "#progressbar" ).progressbar( {disabled: true} );
        // while (graph===true) {
            intervalId = setInterval( ()=> {     // need to understand how i stop it
                getGraph();
            }, 2000);
        // }
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

    let referenceArray;

    function printFive(topFiveUSD) {
        referenceArray = [];
        console.log(topFiveUSD);
        for (coin in topFiveUSD) {
            console.log("coin: " + coin);
            console.log("USD :" + topFiveUSD[coin].USD);  // if not undefined!!!
            referenceArray.push({usd: topFiveUSD[coin].USD});
        }
        console.log("topArr length: " + topArr.length);
        for (let i=topArr.length ; i<5 ; i++) {
            // console.log(i)
            referenceArray.push({usd: 0});
        }
        drawChart();
    }
    
    let visibilityGraph =[]

    // API here:
    // https://canvasjs.com/jquery-charts/dynamic-live-multi-series-chart/
    // MUST SPLICE TOPARRMAP BACK WHEN WE LEAVE LIVE REPORT

    function drawChart() {
        visibilityGraph = [];
        for (i=0; i<topArr.length; i++) {
            topArrMap[i].symbol = topArr[i].symbol;
        }
        let x = {symbol: "xxx"};
        for (i=1; i<=5; i++) {
            if (i<=topArr.length) {
                visibilityGraph.push({visibility: true, showInLegend: true})
            } else {
                visibilityGraph.push({visibility: false, showInLegend: false});
                topArrMap.push(x);
            }
        }

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
                name: `${topArrMap[0].symbol}`,
                dataPoints: dataPoints1,
                visible: visibilityGraph[0].visibility,
                showInLegend: visibilityGraph[0].showInLegend
            },
            {
                type: "line",
                xValueType: "dateTime",
                yValueFormatString: "###.00Wh",
                showInLegend: true,
                name: `${topArrMap[1].symbol}`,
                dataPoints: dataPoints2,
                visible: visibilityGraph[1].visibility,
                showInLegend: visibilityGraph[1].showInLegend
            }, {
                type: "line",
                xValueType: "dateTime",
                yValueFormatString: "###.00Wh",
                showInLegend: true,
                name: `${topArrMap[2].symbol}`,
                dataPoints: dataPoints3,
                visible: visibilityGraph[2].visibility,
                showInLegend: visibilityGraph[2].showInLegend
            },
            {
                type: "line",
                xValueType: "dateTime",
                yValueFormatString: "###.00Wh",
                showInLegend: true,
                name: `${topArrMap[3].symbol}`,
                dataPoints: dataPoints4,
                visible: visibilityGraph[3].visibility,
                showInLegend: visibilityGraph[3].showInLegend
            },
            {
                type: "line",
                xValueType: "dateTime",
                yValueFormatString: "###.00Wh",
                showInLegend: true,
                name: `${topArrMap[4].symbol}`,
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
        var yValue4 = referenceArray[3].usd;
        var yValue2 = referenceArray[1].usd;
        var yValue3 = referenceArray[2].usd; 
        var yValue5 = referenceArray[4].usd;
        
        var time = new Date;
        // starting at 10.00 am
        // time.setHours(10);
        // time.setMinutes(00);
        // time.setSeconds(00);
        // time.setMilliseconds(00);

        function updateChart(count) {
            count = count || 1;
            // var deltaY1, deltaY2, deltaY3, deltaY4, deltaY5;
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
            options.data[0].legendText = `${topArrMap[0].symbol} : ${yValue1} USD`;
            options.data[1].legendText = `${topArrMap[1].symbol} : ${yValue2} USD`;
            options.data[2].legendText = `${topArrMap[2].symbol} : ${yValue3} USD`;
            options.data[3].legendText = `${topArrMap[3].symbol} : ${yValue4} USD`;
            options.data[4].legendText = `${topArrMap[4].symbol} : ${yValue5} USD`;
            $("#liveDiv").CanvasJSChart().render();
        }
        // generates first set of dataPoints 
        updateChart(100);
        setInterval(function () { updateChart() }, updateInterval);
        
        }
});