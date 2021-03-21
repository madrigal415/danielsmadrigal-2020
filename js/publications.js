// File to read in publications from google sheet 

const publicationsURL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vSdMoLdjbXCWBHtdrkEvpgLBx-ouUQtCirElYCaJUSqPsC4WbX4LdmoEWpJUw6q33NIb85mzfcH02VU/pub?gid=2137533580&single=true&output=csv`;


var tabulate = function (data,columns) {
    console.log(data);
    console.log(columns);
    var table = d3.select('body').append('table')
      var thead = table.append('thead')
      var tbody = table.append('tbody')
  
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
  
      var cells = rows.selectAll('td')
          .data(function(row) {
              return columns.map(function (column) {
                  return { column: column, value: row[column] }
            })
        })
        .enter()
      .append('td')
        .text(function (d) { return d.value })
  
    return table;
  }



 d3.csv(publicationsURL)
  .then(function(data) {
      // data is now whole data set
      // draw chart in here!
      var columns = ["id", "title","authors", "year","journal","link"];
      tabulate(data, columns);
  })
  .catch(function(error){
     // handle error   
  })