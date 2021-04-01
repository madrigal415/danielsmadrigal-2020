// File to read in publications from google sheet 

const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);

const publicationsURL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vSdMoLdjbXCWBHtdrkEvpgLBx-ouUQtCirElYCaJUSqPsC4WbX4LdmoEWpJUw6q33NIb85mzfcH02VU/pub?gid=2137533580&single=true&output=csv`;

const publications = `../data/dsm-publications - public.csv`


var tabulate = function (data,columns) {

    var width = document.querySelector('#publications')
        .offsetWidth;
    console.log(width);
    // create table
    var table = d3.select('#publications')
        .append('table')
      
      var thead = table.append('thead');
      var tbody = table.append('tbody');
  
      thead.append('tr')
        .selectAll('th')
          .data(columns)
          .enter()
        .append('th')
          .text(function (d) { return d })
  
      var rows = tbody.selectAll('tr')
          .data(data)
          .enter()
        .append('tr')
        .attr("class", "border-bottom");
  
      var cells = rows.selectAll('td')
          .data(function(row) {
              return columns.map(function (column) {
                  return { column: column, value: row[column] }
            })
        })
        .enter()
      .append('td')
        .text(function (d) { return d.value })
        console.log(data);

    return table;
  }
  
var makeDivs = function(data){
  console.log("testing");
    const pubsDiv = document.querySelector('#publications');
    let publications = "";

    data.map(x =>{
      publications += `<div class="pubs"><h4>${x.title}</h4><hr><p>${x.authors}, ${x.journal},${x.year}</p><p><a href="${x.link}">check it out</a></p></div>`;
    })

    console.log(data);

    pubsDiv.insertAdjacentHTML('beforeend',publications);
  
  }
 

 d3.csv(publications)
  .then(function(data) {
      // data is now whole data set
      // draw chart in here!

      console.log(vw);
      var columns = ["title","authors", "year","journal"];
      if(vw > 600) {
        console.log("BIG");
        tabulate(data, columns);
      }else {
        console.log("SMALL");
        makeDivs(data);
      }

      })
  .catch(function(error){
     // handle error   
  });