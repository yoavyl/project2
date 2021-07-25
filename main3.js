// modal and toggle with functions i know
// to seperate into small functions
// locate "more" button relative to div a-la project1
// use jquery-ajax

$(function () {
    // localStorage.clear();
    $("#aboutDiv, #liveDiv").hide();
    $("#home").css({"background-color" : "#2196F3", "color": "white"});
    $("#about, #live").css({"background-color" : "white", "color": "#2196F3"});
    let myUserPromise = getData();
    myUserPromise = myUserPromise.then(printData);
    myUserPromise.catch(err => alert(err));

    var topArr = []; 

    $("#home").click( function () {
        $("#home").css({"background-color" : "#2196F3", "color": "white"});
        $("#about, #live").css({"background-color" : "white", "color": "#2196F3"});
        $("#liveDiv, #aboutDiv").hide();
        $("#containerDiv").show();
        $(".data").show();
    });

    $("#live").click( function () {
        $("#live").css({"background-color" : "#2196F3", "color": "white"});
        $("#home, #about").css({"background-color" : "white", "color": "#2196F3"});
        $("#containerDiv, #aboutDiv").hide();
        $("#liveDiv").show();
        if (topArr.length !==0) {
            let myUserPromise = getFive();
            myUserPromise = myUserPromise.then(printFive);
            myUserPromise.catch(err => alert(err));
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
        $("#containerDiv").show();
        $(".data").hide();
        $(`#${value}`).show();
        $("#searchInput").val("");
    });

    function getData() {
        return new Promise((resolve, reject) => {
        const ajax = new XMLHttpRequest();
        ajax.onreadystatechange = () => {
            console.log(ajax.readyState);
            if (ajax.readyState === 4) {
                if (ajax.status === 200) {
                    resolve(JSON.parse(ajax.responseText));
                } else {
                    reject(ajax.status + ": Error occured");
                }
            }
        };
        ajax.open("GET", "https://api.coingecko.com/api/v3/coins/list");
        ajax.send();
        });
    }

    function printData(dataList) {
        // for (let i=0 ; i<100 ; i++) {
        for (coin of dataList) {
            if (coin.symbol.length === 3) {
                createCoin(coin, "#containerDiv");
            }
        }
                        
    }
    
    // change the symbol/id mix-up
    function createCoin(coin, div) {
        const coinToPrint = $(`<div class="data" id="${coin.symbol}">
        <label class="switch">
            <input id="${coin.symbol}" name="${coin.name}" idd="${coin.id}" type="checkbox">
            <span class="slider round"></span>
        </label>
        <h3>${coin.symbol}</h3>
        <p>${coin.name}</p>
        <button id="collapsible" class="ui-button ui-widget ui-corner-all" style="background-color:#2196F3;color:white"
            name="${coin.id}">
            More Info
        </button>
        <div class="content">
            <p id="${coin.symbol}"></p>
        </div>
        </div>`);

        coinToPrint.find("input[type=checkbox]").on("click", function() {topFive(this)} );
        coinToPrint.find("#collapsible").on("click", function() {showMore(this)} );

        $(div).append(coinToPrint);
    }
 
    function topFive(top) {
        if (top.checked === false) {
            for (let i=0; i<topArr.length ; i++) {
                if (topArr[i].symbol===top.id) {
                    topArr.splice(i,1);       // deletes this-"top"-object from array
                    console.log("topArr after splice: " + topArr);
                    $(`#containerDiv  input[id=${top.id}]`).prop('checked', false).removeAttr('checked');
                }
            }
            closeModal();
        } else if (topArr.length<5) {
            const coinToPush = {
                symbol: top.id,
                name: top.name,
                id: top.idd
            }
            topArr.push(coinToPush);
            console.log("topArr: " + topArr);
            $(`#containerDiv  input[id=${top.id}]`).prop('checked', true).attr('checked', 'checked');
        } else {
            printToModal();
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
    }

    function printToModal() {
        $(".modal-content").html(`
        <span class="close">&times;</span>
        <p>You can get report of only five coins!
            <br/>
            would you like to remove a coin?
        </p>`);
        for (coin of topArr) {
            createCoin(coin, ".modal-content");
        }
        $(".modal-content").append(`<button class="ui-button ui-widget ui-corner-all closeButton">
                Cancel
            </button>`);
        $('.modal-content :checkbox').prop('checked', true).attr('checked', 'checked');
        $(".closeButton").css({"background-color" : "#2196F3", "color": "white"});

    }

    var modal = document.getElementById("myModal");
    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
      }

    function getFive() {
        let str = "";
        for (coin of topArr) {
            str+=`${coin.symbol},`;
        }
        console.log("str: " + str);
        // use reduce?
        const url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${str}&tsyms=USD`;
        console.log(url);
        return new Promise((resolve, reject) => {
            const ajax = new XMLHttpRequest();
            ajax.onreadystatechange = () => {
                console.log(ajax.readyState);
                if (ajax.readyState === 4) {
                    if (ajax.status === 200) {
                        resolve(JSON.parse(ajax.responseText));
                    } else {
                        reject(ajax.status + ": Error occured");
                    }
                    }
            };
            // need to register for https://min-api.cryptocompare.com/pricing
            ajax.open("GET", url);
            ajax.send();
        });
    }

    function printFive(topFiveUSD) {
        console.log(topFiveUSD);
        $("#liveDiv").empty();
        for (coin in topFiveUSD) {
            console.log("coin: " + coin);
            console.log("USD :" + topFiveUSD[coin].USD);
        }    
    }          

    function showMore(more) {
        more.classList.toggle("active");
        const content = more.nextElementSibling; // to rewrite with the functions that i know
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
            const coinString = sessionStorage.getItem(`${more.name}`);  
            if (coinString === null) {
                console.log(more.name + " is not on sessiobn storage")
                let myUserPromise = getMore(more.name);
                myUserPromise = myUserPromise.then(printMore);
                myUserPromise.catch(err => alert(err));
                setTimeout ( ()=> {
                    sessionStorage.removeItem(`${more.name}`)
                }, 120000);
            } else {
                const coinObj = JSON.parse(coinString); 
                $(`p[id="${coinObj.symbol}"]`).html(
                    `<img src="${coinObj.img}"/> 
                    Current exchange rate: ${coinObj.usd}$,
                    ${coinObj.eur}€,
                    ${coinObj.ils}₪`);                
                console.log("got it from session storages")
            }
        }
    }
    
    function getMore(name) {
        return new Promise((resolve, reject) => {
            const ajax = new XMLHttpRequest();
            ajax.onreadystatechange = () => {
                console.log(ajax.readyState);
                if (ajax.readyState === 4) {
                    if (ajax.status === 200) {
                        resolve(JSON.parse(ajax.responseText));
                    } else {
                        reject(ajax.status + ": Error occured");
                    }
                }
            };
            console.log(name);
            // need to register for https://min-api.cryptocompare.com/pricing
            ajax.open("GET", `https://api.coingecko.com/api/v3/coins/${name}`);
            ajax.send();
        });
    }
            
    function printMore(coin) {
        const coinMoreInfo = {    
            symbol: coin.symbol,
            img: coin.image.thumb,                      
            usd: coin.market_data.current_price.usd,
            eur: coin.market_data.current_price.eur,
            ils: coin.market_data.current_price.ils,
        };
        const coinToStore = JSON.stringify(coinMoreInfo); 
        sessionStorage.setItem(`${coin.id}`, coinToStore);    
        console.log("saved " + coin.id + " to session storage");
        $(`p[id="${coin.symbol}"]`).html(
            `<img src="${coin.image.thumb}"/> 
            Current exchange rate: ${coin.market_data.current_price.usd}$,
            ${coin.market_data.current_price.eur}€,
            ${coin.market_data.current_price.ils}₪`);
    }
        
});


// 
// 
// 

// link to live reports
// https://canvasjs.com/jquery-charts/chart-with-multiple-axes/

// window.onload = function () {

// const options = {
// 	exportEnabled: true,
// 	animationEnabled: true,
// 	title:{
// 		text: "Your selected cryptocurrencies rate in USD"
// 	},
// 	subtitles: [{
// 		text: "Click Legend to Hide or Unhide Data Series"
// 	}],
// 	axisX: {
// 		title: "States"
// 	},
// 	axisY: {
// 		title: "Coin Value",
// 		titleFontColor: "#4F81BC",
// 		lineColor: "#4F81BC",
// 		labelFontColor: "#4F81BC",
// 		tickColor: "#4F81BC"
// 	},
// 	axisY2: {
// 		title: "Profit in USD",
// 		titleFontColor: "#C0504E",
// 		lineColor: "#C0504E",
// 		labelFontColor: "#C0504E",
// 		tickColor: "#C0504E"
// 	},
// 	toolTip: {
// 		shared: true
// 	},
// 	legend: {
// 		cursor: "pointer",
// 		itemclick: toggleDataSeries
// 	},
// 	data: [{
// 		type: "spline",
// 		name: "Units Sold",
// 		showInLegend: true,
// 		xValueFormatString: "MMM YYYY",
// 		yValueFormatString: "#,##0 Units",
// 		dataPoints: [
// 			{ x: new Date(2016, 0, 1),  y: 120 },
// 			{ x: new Date(2016, 1, 1), y: 135 },
// 			{ x: new Date(2016, 2, 1), y: 144 },
// 			{ x: new Date(2016, 3, 1),  y: 103 },
// 			{ x: new Date(2016, 4, 1),  y: 93 },
// 			{ x: new Date(2016, 5, 1),  y: 129 },
// 			{ x: new Date(2016, 6, 1), y: 143 },
// 			{ x: new Date(2016, 7, 1), y: 156 },
// 			{ x: new Date(2016, 8, 1),  y: 122 },
// 			{ x: new Date(2016, 9, 1),  y: 106 },
// 			{ x: new Date(2016, 10, 1),  y: 137 },
// 			{ x: new Date(2016, 11, 1), y: 142 }
// 		]
// 	},
// 	{
// 		type: "spline",
// 		name: "Profit",
// 		axisYType: "secondary",
// 		showInLegend: true,
// 		xValueFormatString: "MMM YYYY",
// 		yValueFormatString: "$#,##0.#",
// 		dataPoints: [
// 			{ x: new Date(2016, 0, 1),  y: 19034.5 },
// 			{ x: new Date(2016, 1, 1), y: 20015 },
// 			{ x: new Date(2016, 2, 1), y: 27342 },
// 			{ x: new Date(2016, 3, 1),  y: 20088 },
// 			{ x: new Date(2016, 4, 1),  y: 20234 },
// 			{ x: new Date(2016, 5, 1),  y: 29034 },
// 			{ x: new Date(2016, 6, 1), y: 30487 },
// 			{ x: new Date(2016, 7, 1), y: 32523 },
// 			{ x: new Date(2016, 8, 1),  y: 20234 },
// 			{ x: new Date(2016, 9, 1),  y: 27234 },
// 			{ x: new Date(2016, 10, 1),  y: 33548 },
// 			{ x: new Date(2016, 11, 1), y: 32534 }
// 		]
// 	}]
// };
// $("#liveDiv").CanvasJSChart(options);

// function toggleDataSeries(e) {
// 	if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
// 		e.dataSeries.visible = false;
// 	} else {
// 		e.dataSeries.visible = true;
// 	}
// 	e.chart.render();
// }

// }