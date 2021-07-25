// to do: hide/show different divs when clicking the different buttons.
// that is - not to delete and write, just hide/show
// iife
// modal and toggle with functions i know
// not "onclick" and such, but use jquery
// to seperate into small functions
// locate "more" button relative to div a-la project1

// לעטוף את הפונקציה בדוקיומנט רדי, ולהפעיל דרך קוורי
// $(document).ready(function(){

//     $("#all").click(function () {
//         Getdate("all");
//         $(`.wrapper`).toggle(1000);

//         return false;
//     });

$(function () {
    // localStorage.clear();
    $("#aboutDiv, #liveDiv").hide();
    // $("#containerDiv").empty();
    $("#home").css({"background-color" : "#2196F3", "color": "white"});
    $("#about, #live").css({"background-color" : "white", "color": "#2196F3"});
    let myUserPromise = getData();
    myUserPromise = myUserPromise.then(printData);
    myUserPromise.catch(err => alert(err));

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
                $("#containerDiv").append(`<div class="data" id="${coin.symbol}">
                <label class="switch">
                    <input id="${coin.symbol}" type="checkbox" onchange="topFive(this)">
                    <span class="slider round"></span>
                </label>
                <h3>${coin.symbol}</h3>
                <p>${coin.name}</p>
                <button id="collapsible" class="ui-button ui-widget ui-corner-all" style="background-color:#2196F3;color:white"
                    name="${coin.id}" onclick="showMore(this)">
                    More Info
                </button>
                <div class="content">
                    <p id="${coin.symbol}"></p>
                </div>
                </div>`);
            }
        }
                        
    }          
// taken from here: https://sabe.io/tutorials/how-to-create-modal-popup-box
// const modal = document.getElementById("modal");
// console.log(modal)
// const trigger = document.querySelector(".trigger");
// const closeButton = document.getElementsByClassName("close-button")[0];
                                                                        
// function toggleModal() {
    // modal.classList.toggle("show-modal");
    // $("#modal").toggleClass("show-modal");

// }
                                                                        
// function windowOnClick(event) {
    // if (event.target === modal) {
        // toggleModal();
    // }
// }
                                                                        
// closeButton.addEventListener("click", toggleModal);
// window.addEventListener("click", windowOnClick);


    function getFive() {
        const str = topArr.toString();
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

    $("#searchButton").click(() => {
        const value = $("#searchInput").val();
        $("#liveDiv, #aboutDiv").hide();
        $("#containerDiv").show();
        $(".data").hide();
        $(`#${value}`).show();
        $("#searchInput").val("");
    });

    
        
});

var topArr = [];  
function topFive(top) {
    if (top.checked === false) {
        for (let i=0; i<topArr.length ; i++) {
            if (topArr[i]===top.id) {
            topArr.splice(i,1);       // deletes this-"top"-object from array
            console.log("topArr after splice: " + topArr)
            }
        }
    } else if (topArr.length<5) {
        topArr.push(top.id);
        console.log("topArr: " + topArr)
    } else {
        // alert(`full`);
        openModal();
        top.checked = false;
    }
}


function openModal() {
    $("#myModal").css("display","block");
    $(".close").click( function () {
        $("#myModal").css("display", "none");
        return;
    });
}

// When the user clicks on <span> (x), close the modal
// $(".close").on("click", function () {$("#myModal").css("display", none)});
// span.onclick = function() {
//   modal.style.display = "none";
// }

// When the user clicks anywhere outside of the modal, close it
// window.onclick = function(event) {
//   if (event.target == modal) {
//     modal.style.display = "none";
//   }
// }
// taken from here: https://sabe.io/tutorials/how-to-create-modal-popup-box

function showMore(more) {
    // var coll = document.getElementById("collapsible");
    // for (i = 0; i < coll.length; i++) {
    //   coll[i].addEventListener("click", function() {
        // coll.addEventListener("click", function() {
        more.classList.toggle("active");
        const content = more.nextElementSibling; // to rewrite with the functions that i know
        if (content.style.display === "block") {
          content.style.display = "none";
        } else {
            content.style.display = "block";
            const coinString = sessionStorage.getItem(`${more.name}`);  
            if (coinString === null) {
                console.log(more.name + " is not on sessiobn storage")
                // set interval every two minutes
                // or work with cache with expiry date
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

// 
// 
// 

// link to live reports
// https://canvasjs.com/jquery-charts/chart-with-multiple-axes/

window.onload = function () {

const options = {
	exportEnabled: true,
	animationEnabled: true,
	title:{
		text: "Your selected cryptocurrencies rate in USD"
	},
	subtitles: [{
		text: "Click Legend to Hide or Unhide Data Series"
	}],
	axisX: {
		title: "States"
	},
	axisY: {
		title: "Coin Value",
		titleFontColor: "#4F81BC",
		lineColor: "#4F81BC",
		labelFontColor: "#4F81BC",
		tickColor: "#4F81BC"
	},
	axisY2: {
		title: "Profit in USD",
		titleFontColor: "#C0504E",
		lineColor: "#C0504E",
		labelFontColor: "#C0504E",
		tickColor: "#C0504E"
	},
	toolTip: {
		shared: true
	},
	legend: {
		cursor: "pointer",
		itemclick: toggleDataSeries
	},
	data: [{
		type: "spline",
		name: "Units Sold",
		showInLegend: true,
		xValueFormatString: "MMM YYYY",
		yValueFormatString: "#,##0 Units",
		dataPoints: [
			{ x: new Date(2016, 0, 1),  y: 120 },
			{ x: new Date(2016, 1, 1), y: 135 },
			{ x: new Date(2016, 2, 1), y: 144 },
			{ x: new Date(2016, 3, 1),  y: 103 },
			{ x: new Date(2016, 4, 1),  y: 93 },
			{ x: new Date(2016, 5, 1),  y: 129 },
			{ x: new Date(2016, 6, 1), y: 143 },
			{ x: new Date(2016, 7, 1), y: 156 },
			{ x: new Date(2016, 8, 1),  y: 122 },
			{ x: new Date(2016, 9, 1),  y: 106 },
			{ x: new Date(2016, 10, 1),  y: 137 },
			{ x: new Date(2016, 11, 1), y: 142 }
		]
	},
	{
		type: "spline",
		name: "Profit",
		axisYType: "secondary",
		showInLegend: true,
		xValueFormatString: "MMM YYYY",
		yValueFormatString: "$#,##0.#",
		dataPoints: [
			{ x: new Date(2016, 0, 1),  y: 19034.5 },
			{ x: new Date(2016, 1, 1), y: 20015 },
			{ x: new Date(2016, 2, 1), y: 27342 },
			{ x: new Date(2016, 3, 1),  y: 20088 },
			{ x: new Date(2016, 4, 1),  y: 20234 },
			{ x: new Date(2016, 5, 1),  y: 29034 },
			{ x: new Date(2016, 6, 1), y: 30487 },
			{ x: new Date(2016, 7, 1), y: 32523 },
			{ x: new Date(2016, 8, 1),  y: 20234 },
			{ x: new Date(2016, 9, 1),  y: 27234 },
			{ x: new Date(2016, 10, 1),  y: 33548 },
			{ x: new Date(2016, 11, 1), y: 32534 }
		]
	}]
};
$("#liveDiv").CanvasJSChart(options);

function toggleDataSeries(e) {
	if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
		e.dataSeries.visible = false;
	} else {
		e.dataSeries.visible = true;
	}
	e.chart.render();
}

}



// //event.target? clickitem function? currenttarget?
// $("#containerDiv").click(`input[type="checkbox"]`, function (event) {
//     const check = $(event.target).attr("id");
//     const test = $(`input[id="${check}"]`).attr("checked");
//     // console.log(test)
//     if ($(`input[id="${check}"]`).is(':not(:checked)')) {
//         for (let i=0; i<topArr.length ; i++) {
//             if (topArr[i]===top.id) {
//             topArr.splice(i,1);       // deletes this-"top"-object from array
//             console.log("topArr after splice: " + topArr)
//             }
//         }
//     } else if (topArr.length<5) {
//         topArr.push(this.id);
//         console.log("topArr: " + topArr)
//     } else {
//         const modal = document.getElementById("modal");
//         console.log(modal)
//         alert(`full`)
//         // toggleModal();
//         $("#modal").toggleClass("show-modal");
//         this.checked = false;
//     }
// })

// this is to have showMore via jquery
// $( "body" ).delegate( "p", "myCustomEvent", function( e, myName, myValue ) {
//     $( this ).text( "Hi there!" );
//     $( "span" )
//       .stop()
//       .css( "opacity", 1 )
//       .text( "myName = " + myName )
//       .fadeIn( 30 )
//       .fadeOut( 1000 );
//   });

//   $("collapsible" ).click(function() {       ===> fit
//     const id = $(this).attr("name");         ===> fit
//     console.log(id);
    // $(`p[id="${id}"]` ).trigger( "myCustomEvent" );  ===> fit
//   });