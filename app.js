
function assignment6() {
    
    let filePath = "project.csv";
    question0(filePath);


}

let question0 = function (filePath) {
    //preprocess data
    d3.csv(filePath).then(function (data) {

        question1(data);
        question3(data);
        question4(data);

    });
}

//airbnb price by state with room type as legend; 
//bar
let question1 = function (data) {
    data.sort(function (a, b) {
        return d3.ascending(a.state, b.state);
    });

    let margin = { top: 30, right: 30, bottom: 90, left: 80 },
        svgwidth = 800 - margin.left - margin.right,
        svgheight = 500 - margin.top - margin.bottom;

    // Create svg
    let svg = d3.select("#q2_plot")
        .append("svg")
        .attr("width", svgwidth + margin.left + margin.right)
        .attr("height", svgheight + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Prepare data for stacked bar chart
    let priceData = d3.rollups(data, v => d3.sum(v, leaf => leaf.price), d => d.state, d => d.room_type);

    let statePriceData = priceData.map(([state, room_types]) => {
        let statePrice = { 'state': state };
        room_types.forEach(([room_type, price]) => {
            statePrice[room_type] = price;
        });
        return statePrice;
    });

    let room_types = Array.from(new Set(priceData.flatMap(([_, types]) => types.map(([type, _]) => type))));


    let xScale = d3.scaleBand()
        .domain(statePriceData.map(d => d.state))
        .range([0, svgwidth])
        .padding(0.1);

    svg.append("g")
        .attr("transform", "translate(0," + svgheight + ")")
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    let yScale = d3.scaleLinear()
        .domain([0, d3.max(statePriceData, d => d3.sum(room_types, key => d[key]))])
        .range([svgheight, 0]);

    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Color scheme
    let color = d3.scaleOrdinal()
        .domain(room_types)
        .range(['#A0D8B0', '#89CFF0', '#E6E6FA', '#FFDAB9']);

    let stack = d3.stack()
        .keys(room_types);

    let series = stack(statePriceData);

    // Add bars
    var tooltip = d3.select("#q2_plot")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px");

    // Function to handle mouseover event
    var mouseover = function (event, d) {
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html("Price: " + (d[1] - d[0]).toFixed(0))
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY) + "px")
            .style("opacity", 1)
            .style('position', 'absolute')
            .style('visibility', 'visible')
            .style('background', 'lightsteelblue');

    }

    // Function to handle mouseleave event
    var mouseleave = function (d) {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    }

    svg.append("g")
        .selectAll("g")
        .data(series)
        .enter().append("g")
        .attr("fill", d => color(d.key))
        .selectAll("rect")
        .data(d => d)
        .enter().append("rect")
        .attr("x", (d, i) => xScale(d.data.state))
        .attr("y", d => yScale(d[1]))
        .attr("height", d => yScale(d[0]) - yScale(d[1]))
        .attr("width", xScale.bandwidth())
        .on("mouseover", mouseover)
        .on("mouseleave", mouseleave);

    // Add a legend
    let legend = svg.selectAll(".legend")
        .data(room_types.reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", svgwidth - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", svgwidth - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(d => d);

    // X-axis title
    svg.append("text")
        .attr("transform", "translate(" + (svgwidth / 2) + " ," + (svgheight + margin.top * 2.5) + ")")
        .style("text-anchor", "middle")
        .text("State");

    // Y-axis title
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left - 4)
        .attr("x", 0 - (svgheight / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Price");

    svg.append("text")
        .attr("x", (margin.left + margin.right + svgwidth) / 2)
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .text("Price and Room Type by State");}

        //network graph



let question3 = function () {
    

    function zoomed({ transform }) {
        graphContainer.attr('transform', transform);
    }

    const svg = d3.select('#q1_plot').append('svg').attr('width', 800).attr('height', 600);

    const graphContainer = svg.append('g');

    svg.call(d3.zoom().on('zoom', zoomed));

    svg.call(d3.zoom().on("zoom", zoomed));

    svg.append("text")
        .attr("x", 400)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .text("Cross-State Investments")
        .style("font-size", "20px");


    d3.json('network_graph.json').then(function (data) { // Update the file path to match the location of your JSON file
        // Create a scale for link thickness
        const linkScale = d3.scaleLinear()
            .domain([0, d3.max(data.links, d => d.value)])
            .range([1, 5]);


        // Create the force simulation
        const simulation = d3.forceSimulation(data.nodes)
            .force("link", d3.forceLink(data.links).id(d => d.id))
            .force("charge", d3.forceManyBody().strength(-100))
            .force("center", d3.forceCenter(400, 300))
            .on("tick", ticked);

        // Create the links
        const links = graphContainer.selectAll("line")
            .data(data.links)
            .enter()
            .append("line")
            .style("stroke", "black")
            .style("stroke-width", d => linkScale(d.value));

        // Create the nodes
        const nodes = graphContainer.selectAll("circle")
            .data(data.nodes)
            .enter()
            .append("circle")
            .attr("r", 10)
            .style("fill", "#68b2a1");

        // Add labels to the nodes
        const labels = graphContainer.selectAll("text")
            .data(data.nodes)
            .enter()
            .append("text")
            .text(d => d.name)
            .style("font-size", "10px")
            .attr("dx", 12)
            .attr("dy", 4);

        // Function to update node and link positions
        function ticked() {
            links
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            nodes
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            labels
                .attr("x", d => d.x)
                .attr("y", d => d.y);
        }
    })}


let question4 = function (data) {
   
    var width = 960;
    var height = 800;
    var margin = 10;
    var stateSym = {
        AZ: 'Arizona',
        AL: 'Alabama',
        AK: 'Alaska',
        AR: 'Arkansas',
        CA: 'California',
        CO: 'Colorado',
        CT: 'Connecticut',
        DC: 'District of Columbia',
        DE: 'Delaware',
        FL: 'Florida',
        GA: 'Georgia',
        HI: 'Hawaii',
        ID: 'Idaho',
        IL: 'Illinois',
        IN: 'Indiana',
        IA: 'Iowa',
        KS: 'Kansas',
        KY: 'Kentucky',
        LA: 'Louisiana',
        ME: 'Maine',
        MD: 'Maryland',
        MA: 'Massachusetts',
        MI: 'Michigan',
        MN: 'Minnesota',
        MS: 'Mississippi',
        MO: 'Missouri',
        MT: 'Montana',
        NE: 'Nebraska',
        NV: 'Nevada',
        NH: 'New Hampshire',
        NJ: 'New Jersey',
        NM: 'New Mexico',
        NY: 'New York',
        NC: 'North Carolina',
        ND: 'North Dakota',
        OH: 'Ohio',
        OK: 'Oklahoma',
        OR: 'Oregon',
        PA: 'Pennsylvania',
        RI: 'Rhode Island',
        SC: 'South Carolina',
        SD: 'South Dakota',
        TN: 'Tennessee',
        TX: 'Texas',
        UT: 'Utah',
        VT: 'Vermont',
        VA: 'Virginia',
        WA: 'Washington',
        WV: 'West Virginia',
        WI: 'Wisconsin',
        WY: 'Wyoming'
    };


    // Calculate the average price per state
    avg_prices = d3.rollup(data, v => d3.mean(v, d => d.price), d => d.state)
    avg_prices = Array.from(avg_prices)
    prices = []
    for (let i = 0; i < avg_prices.length; i++) {
        prices.push({ 'State': avg_prices[i][0], 'Price': avg_prices[i][1] })
    }

    let logScale = d3.scaleLog()
        .domain([d3.min(prices, d => d.Price), d3.max(prices, d => d.Price)])
        .range([0, 200])

    var color = d3.scaleQuantize()
        .domain([-100, 300])
        .range(d3.schemeGreens[7]);


    var svg = d3.select("#q4_plot")
        .append("svg").attr("width", width)
        .attr("height", height);




    const projection = d3.geoAlbersUsa().translate([width / 2, height / 2])
        .scale([1000]);
    const pathgeo1 = d3.geoPath().projection(projection);
    const statesmap = d3.json("us-states.json");
    let selectedStateId = null;
    
    statesmap.then(function (map) {
        for (var i = 0; i < prices.length; i++) {
            var state = prices[i].State;
            var value = prices[i].Price;
            for (var j = 0; j < map.features.length; j++) {
                var mapState = map.features[j].properties.name;
                if (state == stateSym[mapState]) {
                    map.features[j].properties.value = value;
                    break;
                }
            }
        }

        

       var tooltip = d3.select("#q4_plot")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px");

        var tooltip = d3.select("#q4_plot")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px");

        // Function to handle mouseover event
        var mouseover = function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("State: " + d.properties.name + "<br/>" + "Average price: " + (d.properties.value ? d.properties.value.toFixed(0) : "N/A"))
     
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY) + "px")
                .style("opacity", 1)
                .style('position', 'absolute')
                .style('visibility', 'visible')
                .style('background', 'lightsteelblue');
        }

        // Function to handle mouseleave event
        var mouseleave = function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        }

        svg.selectAll("path")
            .data(map.features)
            .enter()
            .append("path")
            .attr("d", pathgeo1)
            .style('fill', function (d) {
                var value = d.properties.value;
                if (value) {
                    return color(logScale(value))
                } else {
                    return '#ccc'
                }
            })
            .on("mouseover", mouseover)
            .on("mouseleave", mouseleave);
            //title
        svg.append('text')
            .attr('x', (width / 2))
            .attr('y', margin+100)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")

            .text("Average Cost of Airbnb Stays in Top Travel States");
//add legend
// Define the size and position of the legend
var legendWidth = 300;
var legendHeight = 20;
var legendX = width - legendWidth - margin;
var legendY = height - legendHeight - margin - 50;



        var legend = svg.append("g")
            .attr("transform", "translate(" + legendX + "," + legendY + ")");

// Define the x scale for the legend
var legendX = d3.scaleLinear()
    .domain([d3.min(prices, d => d.Price), d3.max(prices, d => d.Price)])
    .range([0, legendWidth]);

// Define the color scale for the legend (same as the map color scale)
var legendColor = color;

// Add the color gradient to the legend
legend.append("defs")
    .append("svg:linearGradient")
    .attr("id", "gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%")
    .selectAll("stop")
    .data(legendColor.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: legendColor(t) })))
    .enter().append("stop")
    .attr("offset", d => d.offset)
    .attr("stop-color", d => d.color);

// Add the color legend rectangle
legend.append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#gradient)");

// Add the legend axis

var legendAxis = d3.axisBottom(legendX).ticks(5).tickFormat(d3.format(".0s"));
legend.append("g")
    .attr("transform", "translate(0," + legendHeight +")")
    .call(legendAxis);



})
    


    
//     var width = 960;
//     var height = 800;
//     var margin = 50;

//     // Calculate the average price per state
//     avg_prices = d3.rollup(data, v => d3.mean(v, d => d.price), d => d.state)
//     avg_prices = Array.from(avg_prices)
//     prices = []
//     for (let i = 0; i < avg_prices.length; i++) {
//         prices.push({ 'State': avg_prices[i][0], 'Price': avg_prices[i][1] })
//     }
//     let logScale = d3.scaleLog()
//         .domain([d3.min(prices, d => d.Price), d3.max(prices, d => d.Price)])
//         .range([0, 200])

//     var color = d3.scaleQuantize()
//         .domain([0, 200])
//         .range(d3.schemeBlues[7]);

//     var svg = d3.select("#q4_plot")
//         .append("svg").attr("width", width)
//         .attr("height", height);

//     const projection = d3.geoAlbersUsa().translate([width / 2, height / 2])
//         .scale([1000]);
//     const pathgeo1 = d3.geoPath().projection(projection);
//     const statesmap = d3.json("us-states.json");
//     statesmap.then(function (map) {
//         for (var i = 0; i < prices.length; i++) {
//             var state = prices[i].State;
//             var value = prices[i].Price;
//             for (var j = 0; j < map.features.length; j++) {
//                 var mapState = map.features[j].properties.name;
//                 if (state == mapState) {  // Directly comparing the state names
//                     map.features[j].properties.value = value;
//                     break;
//                 }
//             }
//         }
//         svg.selectAll("path")
//             .data(map.features)
//             .enter()
//             .append("path")
//             .attr("d", pathgeo1)
//             .style('fill', function (d) {
//                 var value = d.properties.value;
//                 if (value) {
//                     return color(logScale(value))
//                 } else {
//                     return '#ccc'
//                 }
//             })
//         svg.append('text')
//             .attr('x', (width / 2))
//             .attr('y', margin)
//             .attr("text-anchor", "middle")
//             .style("font-size", "20px")
//             .text("Sales in United States ");

//     });



}
