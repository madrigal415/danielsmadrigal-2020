function makeChart(data, group, target, measure1) {
    console.log(data);
    console.log(group);
     // // SORT BY DATE
     // data = data.sort((a, b) => (a.date < b.date ? -1 : 1));
     // // KEEP ONLY LAST 8 entrics
     // data = data.slice(-8);
   
     // ADD NEW ENTRY FOR rate
     data.forEach((x) => {
       x.caseRate = Math.round(
         (x.total_cases / (39512223 * x.percent_of_ca_population * 0.01)) * 100000,
         0
       );
       x.deathRate = Math.round(
         (x.deaths / (39512223 * x.percent_of_ca_population * 0.01)) * 100000,
         0
       );
     });
   
     // // SORT BY CASE RATE PER 100k
     data = data.sort((a, b) => (a.caseRate > b.caseRate ? -1 : 1));
   
     // filter out "Other" because data does not provide percent of CA population
     data = data.filter((i) => i.demographic_value !== 'Other');
 
     console.log(`DATA CHECK for ${target}`);
     console.table(data);
   
     // PROCESSING DATA AND MAKING THE CHART
     data = data.map((i) => {
       i[group] = i[group];
       return i;
     });
   
     // ADD EXPLANATORY TEXT
     const widthChart = document.querySelector(target).offsetWidth;
 
     const container = d3.select(target);
     const width = widthChart;
     const height = 250;
     const margin = { top: 10, right: 20, bottom: 110, left: 60 };
     const barPadding = 0.2;
     const axisTicks = {
       qty: 4,
       innerSize: -widthChart,
       outerSize: 0,
       ticks: 4,
     };
 
     if(document.querySelector('body').offsetWidth<900) {
       margin.bottom = 30;
       console.log(margin);
 
     if(!document.querySelector('#raceLabels')){
       document.querySelector('details').insertAdjacentHTML('beforebegin',`<div id='raceLabels' style="padding-top: 10px; font-size: 8px;"><p>Na.: Native Hawaiian and other Pacific Islander,  La: Latino, Mu: Multi-Race, Bl: Black, Am: American Indian or Alaska Native, Wh. White, As.: Asian.</p></div>`);
     }
     }
   
     // create a tooltip
     const Tooltip = d3
       .select(target)
       .append('div')
       .style('position', 'absolute')
       .style('opacity', 0)
       .attr('class', 'tooltip')
       .style('background-color', 'white')
       .style('color', 'rgb(51, 83, 138)')
       .style('border', 'solid')
       .style('border-width', '3px')
       .style('border-radius', '5px')
       .style('padding', '5 20px')
       .style('pointer-events', 'none');
 
     // Three function that change the tooltip when user hover / move / leave a cell
     const mouseover = function (d) {
       Tooltip.transition().duration(500).style('opacity', .9).style('display', 'block');
     };
     const mousemove = function (d) {
   
       Tooltip.html(
         `<h4>${d.demographic_value}</h4><p>cases: ${commaSeparateNumber( d.total_cases)} <br>case rate: ${commaSeparateNumber(d.caseRate)} per 100,000<br>deaths: ${commaSeparateNumber(d.deaths)}<br>death rate: ${commaSeparateNumber(d.deathRate)} per 100,000</p>`
       )
         .style('left', `${d3.mouse(this)[0]}px`)
         .style('top', `${d3.mouse(this)[1]}px`)
         .style('left', `${d3.event.pageX + 5}px`)
         .style('top', `${d3.event.pageY - 28}px`);
     };
   
     const mouseleave = function (d) {
       Tooltip.transition()
         .duration(500)
         .style('opacity', 0)
         .transition()
         .delay(500)
         .style('display', 'none');
     };
   
     const previousSVG = document.querySelector(`${target} svg`);
     if (previousSVG) {
       previousSVG.parentNode.removeChild(previousSVG);
     }
   
     const svg = container
       .append('svg')
       .attr('width', width)
       .attr('height', height * 0.95)
       .append('g')
       .attr('transform', `translate(${margin.left},${margin.top})`);
   
     const xScale0 = d3
       .scaleBand()
       .range([0, width - margin.left - margin.right])
       .padding(barPadding);
     const xScale1 = d3.scaleBand();
     const yScale = d3.scaleLinear().range([height - margin.top - margin.bottom, 0]);
   
     const xAxis = d3.axisBottom(xScale0).tickSizeOuter(axisTicks.outerSize);
     const yAxis = d3
       .axisLeft(yScale)
       .ticks(axisTicks.qty)
       .tickSizeOuter(axisTicks.outerSize)
       .tickSizeInner(axisTicks.innerSize)
       .ticks(axisTicks.ticks, ',f');
     // .tickSize(-widthChart);
   
     xScale0.domain(data.map((d) => d[group]
       ));
     xScale1.domain([measure1]).range([0, xScale0.bandwidth()]);
 
     yScale.domain([
       0,
       d3.max(data, (d) =>
         
           (d[measure1] / (39512223 * d.percent_of_ca_population * 0.01)) * 100000
       ),
     ]);
   
     // Add the X Axis
     svg
       .append('g')
       .attr('class', 'x axis')
       .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
       .style('font-size', '12px')
       .call(xAxis)
       .selectAll('.tick text')
       .call(wrap, xScale1.bandwidth());
   
     // Add the Y Axis
     svg.append('g').attr('class', 'y axis').call(yAxis);
   
     //
     // .ticks(4, ",f"))
     // .tickSize(-height, 0, 0)
     // .tickFormat("")
   
     // text label for the y axis
     svg
       .append('text')
       .attr('transform', 'rotate(-90)')
       .attr('y', 0 - margin.left)
       .attr('x', 0 - height * 0.4)
       .attr('dy', '1em')
       .style('text-anchor', 'middle')
       .style('font-size', '14px')
       .text(`${measure1=== 'total_cases'?'cases':'deaths'} per 100,000 people`);
   
     var group = svg
       .selectAll('.group')
       .data(data)
       .enter()
       .append('g')
       .attr('class', 'group')
       .attr('transform', (d) => `translate(${xScale0(d[group])},0)`);
   
     /* Add field1 bars */
     group
       .selectAll(`.bar.${measure1}`)
       .data((d) => [d])
       .enter()
       .append('rect')
       .attr('class', `bar ${measure1}`)
       .style('fill', measure1 === 'cases' ? 'rgb(138,160,199)' : 'rgb(73, 114, 184)')
       .style('stroke', 'red')
       .style('stroke-width', 0)
       .attr('x', (d) => xScale1(measure1) * 0.5)
       .attr('y', (d) =>
         yScale((d[measure1] / (39512223 * d.percent_of_ca_population * 0.01)) * 100000)
       )
       .attr('width', xScale1.bandwidth())
       .attr(
         'height',
         (d) =>
           height -
           margin.top -
           margin.bottom -
           yScale((d[measure1] / (39512223 * d.percent_of_ca_population * 0.01)) * 100000)
       )
       .on('mouseenter', mouseover)
       .on('mousemove', mousemove)
       .on('mouseleave', mouseleave);
 
       getCurrentDate(data);
   } // end makeChart();
   
   // get date
   function getCurrentDate(data) {
     const date = new Date(data[0].report_date);
     const dateText = `Rates of COVID-19 Cases and Deaths by Race/Ethnicity in California as of ${
       date.getMonth() + 1
     }.${date.getDate()}.${date.getYear() + 1900}`;
   
 
   
     const dateDiv = document.querySelector('#dataDate');
     dateDiv.innerHTML = `${dateText}`;
   }
 
 
   
   async function loadJson(url) {
     // (1)
     const response = await fetch(url); // (2)
   
     const json = await response.json(); // (3)
     return json;
   }
   
   
   function wrap(text, width) {
   
     text.each(function () {
 
       const bodyW = document.querySelector('body').offsetWidth;      
       const text = d3.select(this);
       // console.log(svgW, svgW > 800);
       const words = bodyW > 900 ? text.text().split(/\s+/).reverse(): Array(text.text().split(/\s+/)[0].substring(0,2).concat('.'));
   
       let word;
       let line = [];
       let lineNumber = 0;
       const lineHeight = 1.5; // ems
       const y = text.attr('y');
       const dy = parseFloat(text.attr('dy'));
       let tspan = text
         .text(null)
         .append('tspan')
         .attr('x', 0)
         .attr('y', y)
         .attr('dy', `${dy}em`);
         // .attr('dy', `em`);
       while ((word = words.pop())) {
         line.push(word);
         tspan.text(line.join(' '));
         if (tspan.node().getComputedTextLength() > width) {
           line.pop();
           tspan.text(line.join(' '));
           line = [word];
           tspan = text
             .append('tspan')
             .attr('x', 0)
             .attr('y', y)
             .attr('dy', `${++lineNumber * lineHeight + dy}em`)
             .text(word);
         }
       }
 
 
     });
   }
   
   const covidURL =`https://data.chhs.ca.gov/api/3/action/datastore_search_sql?sql=SELECT * from "e2c6a86b-d269-4ce1-b484-570353265183" WHERE "demographic_category" LIKE 'Race Ethnicity' ORDER BY "report_date" DESC LIMIT 8`;
 
   
   function raceFilter() {
     loadJson(covidURL)
       .then((d) => d.result.records) // get record
       .then((d) => {
         console.log(`***\n`,d)
         makeChart(d, 'demographic_value', '#d3idD', 'deaths');
         makeChart(d, 'demographic_value', '#d3idC', 'total_cases');
       }).catch((err) => console.log(`Err ${err}`)); // Error: 404 (4)
   }
   
   // ADDING EVENT LISTENER TO CHANGE SIZE OF WINDOW
   window.addEventListener('resize', (e) => {
       raceFilter();
   });
   
   window.onload = () => {
     raceFilter();
   };
   
   // add Commas
   function commaSeparateNumber(val) {
     while (/(\d+)(\d{3})/.test(val.toString())) {
       val = val.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
     }
     return val;
   }