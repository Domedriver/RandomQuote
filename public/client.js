var d3

var margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = 300 - margin.right - margin.left,
    height = 300 - margin.top - margin.bottom,
    radius = width / 2;

var color = d3.scaleOrdinal()
  .range(['#e41a1c','#377eb8','#4daf4a','#984ea3'])

// arc generator
var arc = d3.arc()
  .outerRadius(radius - 10)
  .innerRadius(radius - 75)

var labelArc = d3.arc()
  .outerRadius(radius - 45)
  .innerRadius(radius - 45)

// pie generator
var pie = d3.pie()
  .sort(null)
  .value(function(d) {return d.count})

function pieTween(b) {
  b.innerRadius = 0;
  var i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
  return function(t) {return arc(i(t))}
}


function request(method, endpoint, callback) {
  var req = new XMLHttpRequest()
  req.open(method, endpoint, true)
  req.send()
  req.onload = function() {
    var json = JSON.parse(req.responseText)
    callback(json)
  }  
}

function makeBottom(numQuotes, callback) {  
  request("GET", "/api/quote/all", function(result) {    
    if (Object.keys(result).length !== 0) {      
      var quote = '"' + result.quote + '"     --' + result.author
      var randomQuote = document.createElement('div')
      randomQuote.setAttribute('id', 'quote-container')
      document.getElementById('bottom-container').appendChild(randomQuote)
      var quoteLocation = document.getElementById('quote-container')
      quoteLocation.textContent = quote      
      callback(numQuotes)
    }
  })  
}

function makeDonut(quotes) {  
  request("GET", "/api/quote/allquotes", function(result) {    
    if (Object.keys(result).length !== 0) {      
      var results = result.reduce(function(total, item) {
        total[item.category] = (total[item.category] || 0) + 1;
        return total;
          }, {})
      
      var categories = {
        movie: "Movie",
        book: "Book",
        realperson: "Real Person",
        other: "Other"
      }
      
      results = Object.entries(results).map(el => ({category: categories[el[0]], count: el[1]}))      
      
      // define svg
      var svg = d3.select('#bottom-container')
        .append('div')
        .attr('id', 'svg-container')      
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
        
      svg.append('text')
        .attr('text-anchor', 'middle')
        .text(quotes + ' quotes in database')
      
      var g = svg.selectAll('.arc')
        .data(pie(results))
        .enter()
        .append('g')
        .attr('class', 'arc')        
      
      g.append('path')        
        .attr('id', function(d, i) {return 'arc_'+i})
        .attr('d', arc)
        .style('fill', function(d) {return color(d.data.category)})
        .transition()
        .ease(d3.easeLinear)
        .duration(1000)
        .attrTween('d', pieTween)
      
      
      /*g.append('text')        
        .attr('x', 20)
        .attr('dy', 18)
        .append('textPath')
        .attr('xlink:href', function(d, i) {return '#arc_'+i})        
        .text(function(d) {return d.data.category})*/
      
      g.append('text')
        .attr('transform', function(d) {return 'translate(' + labelArc.centroid(d) + ')'})
        .style('text-anchor', 'middle')
        .text(function(d) {return d.data.category})
      
      }
  })
}

document.addEventListener('DOMContentLoaded', function() {
  var totalQuotes = document.getElementById('quotes')  
  request("GET", "/api/quotenum", function(result) {
    totalQuotes.textContent = result.counter;
  })
  request("GET", "/api/quotenum", function(result) {    
    makeBottom(result.counter, function(quotes) {makeDonut(quotes)})
  })  
})
          