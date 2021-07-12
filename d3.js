function setTablesDropdown() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', './db/MIStats.db', true);
  xhr.responseType = 'arraybuffer';

  xhr.onload = function(e) {
    var uInt8Array = new Uint8Array(this.response);
    var db = new SQL.Database(uInt8Array);
    var tables = db.exec("SELECT * FROM sqlite_master WHERE type = 'view'");

    var indexOfName;
    tables[0].columns.forEach((ele,i) => { if (ele === 'name') indexOfName = i })

    let dropdownHTML = '';
    for (var i = 0; i < tables[0].values.length; i++) {
      let tableName = tables[0].values[i][indexOfName];
      if (tableName !== 'MISTATS')
        dropdownHTML += "<option value='" + tableName + "'>" + tableName + "</option>";
    }

    document.getElementById('views').innerHTML = dropdownHTML;
  }

  xhr.send();
}


setTablesDropdown();



 


function toggleView() { 
  document.getElementById('dashboard').innerHTML = '';

  var xhr = new XMLHttpRequest();
  xhr.open('GET', './db/MIStats.db', true);
  xhr.responseType = 'arraybuffer';




  xhr.onload = function(e) {
    var uInt8Array = new Uint8Array(this.response);
    var db = new SQL.Database(uInt8Array);
    // get list of all views
    var selected_table = document.getElementById('views').value;
    var contents = db.exec("SELECT * FROM " + selected_table);
    console.log(contents);
    console.log(contents[0]);

    var obj = [];
    obj.push({label:'Total Zipcodes', value:getValue(contents, "Total Zipcodes") });
    obj.push({label:'Avg Income', value:getValue(contents, " Avg Income") });
    createCards(obj);


    var obj = []; 
    obj.push({label:'Percent Republican', value:getValue(contents, "Avg Percent Republican") });
    obj.push({label:'Percent Democrat', value:getValue(contents, "Avg Percent Democrat") });
    createPieChart(obj);
    

    
    var obj = [];  
    obj.push({label:'Avg Violent Crime', value:getValue(contents, "Avg Murder") });
    obj.push({label:'Avg Murder', value:getValue(contents, "Avg Murder") });
    obj.push({label:'Avg Rape', value:getValue(contents, "Avg Rape") });
    obj.push({label:'Avg Robbery', value:getValue(contents, " Avg Robbery") });
    obj.push({label:'Avg Aggravated Assault', value:getValue(contents, "Avg Aggravated Assault") });
    obj.push({label:'Avg Property Crime', value:getValue(contents, "Avg Property Crime") });
    obj.push({label:'Avg Burglary', value:getValue(contents, " Avg Burglary") });
    obj.push({label:'Larency Theft', value:getValue(contents, "Larency Theft") });
    obj.push({label:'Avg Motor Vehicle Theft', value:getValue(contents, "Avg Motor Vehicle Theft") });
    obj.push({label:'Avg Arson', value:getValue(contents, "Avg Arson") });
    createBarChart(obj);





    var div = document.createElement("div");
    document.getElementById('dashboard').appendChild(div);
    div.innerHTML = JSON.stringify(contents);

    // contents is now [{columns:['col1','col2',...], values:[[first row], [second row], ...]}]
  };


  xhr.send();
}


function getValue(obj, key) {
  let index = -1;
  obj[0].columns.forEach((ele, i) => { if (ele === key) index = i; });
  return obj[0].values[0][index];
}


function createCards(data) {
  var table = document.createElement('table');
  document.getElementById('dashboard').appendChild(table);

  // header row
  var row = document.createElement('tr');
  table.appendChild(row);

  

  data.forEach((ele) => {
    // create chart div
    var th = document.createElement("th");
    th.innerHTML = ele.label;
    row.appendChild(th);
  });

  // value row
  var row = document.createElement('tr');
  table.appendChild(row);

  data.forEach((ele) => {
    // create chart div
    var td = document.createElement("td");
    td.innerHTML = ele.value;
    row.appendChild(td);
  });


  document.getElementById('dashboard').appendChild(document.createElement('br'));

}

function createPieChart(data) {
  var width = 360;
  var height = 360;
  var radius = Math.min(width, height) / 2;
  var color = d3.scaleOrdinal(d3.schemeCategory20b);

  // Alternative
  var color = d3.scaleOrdinal()
  .range(['#A60F2B', '#0039e6', '#648C85', '#B3F2C9', '#528C18', '#C3F25C']);

  var container = document.createElement('div');
  document.getElementById('dashboard').appendChild(container);
  container.style.overflow = 'hidden';

  // create chart div
  var div = document.createElement("div");
  container.appendChild(div);
  div.style.float = 'left';

  // select created div and insert SVG
  var svg = d3.select(div)
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('transform', 'translate(' + (width / 2) +  ',' + (height / 2) + ')');

  // set arc of pie
  var arc = d3.arc()
  .innerRadius(0)
  .outerRadius(radius);

  // set values of pie slices
  var pie = d3.pie()
  .value(function(d) { return d.value; })
  .sort(null);

  // set path tags
  var path = svg.selectAll('path')
  .data(pie(data))
  .enter()
  .append('path')
  .attr('d', arc)
  .attr('fill', function(d, i) {
    return color(d.data.label);
  });


  // data labels
  var g = svg.selectAll('g')
  .data(pie(data))
  .enter()
  .append("text")
  .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
  .text(function(d) { return d.data.value + '%' })
  .style("fill", "black");



  // build legend
  var legendRectSize = 18;
  var legendSpacing = 4;

  var svg = d3.select(container).append('svg');

  var legend = svg.selectAll('.legend')
  .data(color.domain())
  .enter()
  .append('g')
  .attr('class', 'legend')
  .attr('transform', function(d, i) {
    var height = legendRectSize + legendSpacing;
    var offset =  height * color.domain().length / 2;
    var horz = 2 * legendRectSize;
    var vert = i * height + offset;
    return 'translate(' + horz + ',' + vert + ')';
  });


  legend.append('rect')
  .attr('width', legendRectSize)
  .attr('height', legendRectSize)
  .style('fill', color)
  .style('stroke', color);

  legend.append('text')
  .attr('x', legendRectSize + legendSpacing)
  .attr('y', legendRectSize - legendSpacing)
  .text(function(d) { return d; });

}


function createBarChart(data) {
  var height = 500;
  var width = 960;


  var container = document.createElement('div');
  document.getElementById('dashboard').appendChild(container);
  container.style.overflow = 'hidden';

  // create chart div
  var div = document.createElement("div");
  container.appendChild(div);
  div.style.float = 'left';

  // create chart svg  
  var svg = d3.select(div)
  .append('svg')
  .attr('width', width)
  .attr('height', height);
  

  var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = +width - margin.left - margin.right,
    height = +height - margin.top - margin.bottom;

  // body of chart
  var g = svg.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // x and y axis
  var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
      y = d3.scaleLinear().rangeRound([height, 0]);
  
  // set x and y axis domains (text)
  x.domain(data.map(function(d) { return d.label; }));
  y.domain([0, d3.max(data, function(d) { return d.value; })]);

  // config x axis
  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  // configure y axis 
  g.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(y).ticks(10))
  .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .text("Frequency");

  // create bars
  g.selectAll(".bar")
    .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.label); })
      .attr("y", function(d) { return y(d.value); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return height - y(d.value); });
      
      
  g.selectAll('.text')
    .data(data)
    .enter().append('text')
    .attr("class","label")
    .text(function(d) { return d.value })
    .attr("x", function(d) { return x(d.label) + x.bandwidth()/2; })
    .attr("y", function(d) { return y(d.value) - 15; })
    .attr("dy", ".75em");

}
















