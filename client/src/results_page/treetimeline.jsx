var React = require('react');

var dates = [];
var generateDates = function(timeSpan) {
  for (var i = -1; i < timeSpan; i++) {
    var date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toJSON().slice(0, 10));
  }
}

generateDates(7);

var i = 0;

var TreeTimeLine = React.createClass({

  getInitialState: function(){
    return {
      // wasSearchedFromTopBar: false,
      // searchTerm: '',
      apiData: [],
    };
  },

  apis: [
    'nyt',
    'twitter',
    'youtube'
  ],

  apiCounter: 0,

  query: function(searchTerm){
    console.log('searchTerm * * * * * * * * * * * * * * * * : ', searchTerm);
    this.apiCounter = 0;
    for(var i = 0; i < this.apis.length; i++){
      this.handleQuery({
        searchTerm: searchTerm,
        url: 'http://127.0.0.1:3000/api/' + this.apis[i],
        api: this.apis[i]
      });
    }
  },

  componentDidMount: function(){
    this.query(this.props.searchTerm);
  },

  componentWillReceiveProps: function(newProps){
    if (this.props.searchTerm !== newProps.searchTerm) {
      this.query(newProps.searchTerm);
    }
  },

  handleQuery: function(searchQuery){
    $.post(searchQuery.url, searchQuery)
     .done(function(response) {

        // Set State to initiate a re-rendering based on new API call data
        this.setState(function(previousState, currentProps) {
          // Make a copy of previous apiData to mutate and use to reset State
          // Data is structured in an array that corresponds to sorted order by date descending
          // where each index has the following object:
          /*
              {
                'date': 'YYYY-MM-DD',
                'children': [
                  {
                    'source': 'nyt',
                    'children': [ {Article 1}, {Article 2}]
                  }
                ]
              }
          */
      
          if (this.apiCounter === 0) {
            var previousApiData = [];
          } else {
            var previousApiData = previousState['apiData'].slice();
          }
          this.apiCounter++;
          console.log('apiCounter * * * * * * * * * * * * * * * * * * * : ', this.apiCounter);

          // Loop through each day in apiData and add new articles/videos/etc
          // from returning API appropriately
          for(var date in response) {
            var i = 0;
            for(; i < previousApiData.length; i++) {
              if(previousApiData[i]['date'] === date) {
                previousApiData[i]['children'].push(response[date]);
                break;
              }
            }
            // If loop terminates fully, no content exists for date
            // so add content to the State array
            if(i === previousApiData.length) {
              previousApiData.push(
                {
                  'date': date, 
                  'children': [
                    response[date]
                  ]
                });
            }
          }
          // Sort State array with API data by date descending
          previousApiData.sort(function(a, b) {
            var aDate = new Date(a['date']);
            var bDate = new Date(b['date']);
            return bDate - aDate;
          });
          return {apiData: previousApiData};
        });
     }.bind(this));
  },

  render: function() {
    this.renderCanvas();    // Crucial step that (re-)renders D3 canvas
    return (
      <div id="d3container" style={this.style}></div>
    )
  },

  style: {
    position: 'fixed',
    marginTop: '50px',
    left: '50px'
  },

  mouseOver: function(item) {
    this.props.mouseOver({
        title: item.title,
        date: item.date,
        url: item.url,
        img: item.img,
        source: item.parent.source,
        id: item.id,
        byline: (item.hasOwnProperty('byline') ? item.byline : ''),
        abstract: (item.hasOwnProperty('abstract') ? item.abstract : ''),
        height: (item.hasOwnProperty('height') ? item.height : ''),
        width: (item.hasOwnProperty('width') ? item.width : ''),
      });
  },

  renderCanvas: function() {

    var component = this;
    d3.select('svg').remove();

    var margin = {
      top: 10,
      right: 40,
      bottom: 20,
      left: 40
    };

    var width = 320,
        height = 680;

    var firstDate = this.state.apiData[this.state.apiData.length - 1] ? 
                    this.state.apiData[this.state.apiData.length - 1]['date'] :
                    dates[dates.length - 1];

    var y = d3.time.scale()
      .domain([new Date(firstDate), new Date(dates[0])])
      .rangeRound([height - margin.top - margin.bottom, 0])

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient('left')
      .ticks(d3.time.days, 1)
      .tickFormat(d3.time.format('%a %d'))
      .tickSize(0)
      .tickPadding(20)

    var svg = d3.select('#d3container').append('svg')
      .attr('class', 'timeLine')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', 'translate(60, ' + margin.top + ')')

    svg.append('g')
      .attr('class', 'yAxis')
      .attr({
        'font-family': 'Arial, sans-serif',
        'font-size': '10px',
      })
      .attr({
        fill: 'none',
        stroke: '#000',
        'shape-rendering': 'crispEdges',
      })
      .call(yAxis);

    var timeLine = svg.selectAll('.timeLine')
      .data({ 'name': 'data', 'children': this.state.apiData })
      .attr('y', function(d) { return y(new Date(d.date)); })

    svg.selectAll('g.node').remove();


    //-----draw tree from each tick on yAxis timeline ------

    var root;

    var tree = d3.layout.tree()
        .size([height, width])

    var diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.y, d.x]; });

      root = { 'name': 'data', 'children': this.state.apiData };
      root.x0 = height / 1.5;
      root.y0 = 0;

    function toggleAll(d) {
        if (d.children) {
          d.children.forEach(toggleAll);
          toggle(d);
        }
      }

      // Initialize the display to show a few nodes.
      // root.children.forEach(toggleAll);
      // toggle(root.children[0]);

      update(root);

    function update(source) {
      var duration = 500;

      var nodes = tree.nodes(root).reverse();
      var links = d3.layout.tree().links(nodes);

      nodes.forEach(function(d) { 
        if (d.depth === 1) {
          d.x = y(new Date(d.date)) - 10;
          d.y = 0;
          d.fixed = true;
        }
        else {
          d.y = d.depth * 60; 
          }
        });

      // Update the nodes…
      var node = svg.selectAll("g.node")
          .data(nodes, function(d) { return d.id || (d.id = ++i); });

      // Enter any new nodes at the parent's previous position.
      var nodeEnter = node.enter().append("svg:g")
        .attr("class", "node")
        .on("click", function(d) {
          if (d.title) {
            console.log(d);
            // d3.select(d).html('<a href=' + d.url + ' target+_blank></a>');
            return;
          }
          console.log(d);
          toggle(d); 
          update(d); 
        })
        .on("mouseenter", function(d) {
          if (d.title) {
            component.mouseOver(d);
            d3.select(this)
              .attr('r', 35)
          }
        })
        .on("click", function(d) {
          if (d.url) { 
            window.open(d.url,'_blank');
          } else if (d.parent.source === 'youtube') {
            window.open('https://www.youtube.com/watch?v=' + d.id, '_blank');
          }
        })

      d3.selectAll('g.node')
        .append('a')
        .attr('xlink:href', function(d) {
          if (d.title) {
            return d.url;
          }
        })

      var defs = svg.append('svg:defs');
        defs.append('svg:pattern')
          .attr('id', 'tile-twit')
          .attr('width', '20')
          .attr('height', '20')
          .append('svg:image')
          .attr('xlink:href', 'https://g.twimg.com/Twitter_logo_blue.png')
          .attr('x', 4)
          .attr('y', 5)
          .attr('width', 15)
          .attr('height', 15)
        defs.append('svg:pattern')
          .attr('id', 'tile-nyt')
          .attr('width', '20')
          .attr('height', '20')
          .append('svg:image')
          .attr('xlink:href', 'http://www.hitthefloor.com/wp-content/uploads/2014/03/20-new-york-times-t-1.jpg')
          .attr('x', -7)
          .attr('y', -7)
          .attr('width', 40)
          .attr('height', 40)
        defs.append('svg:pattern')
          .attr('id', 'tile-youtube')
          .attr('width', '20')
          .attr('height', '20')
          .append('svg:image')
          .attr('xlink:href', 'https://lh5.ggpht.com/jZ8XCjpCQWWZ5GLhbjRAufsw3JXePHUJVfEvMH3D055ghq0dyiSP3YxfSc_czPhtCLSO=w300')
          .attr('x', 4)
          .attr('y', 5)
          .attr('width', 15)
          .attr('height', 15)

      nodeEnter.append("svg:circle")
        .attr("r", 1e-6)
        .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; })
        .style({
          cursor: 'pointer',
          fill: '#fff',
          stroke: 'steelblue',
          strokeWidth: '1.5px',
        })

      var nodeUpdate = node.transition()
          .duration(duration)
          .attr("transform", function(d) { 
            if (d == root) {
              d.y = -1000;
            }
            return "translate(" + d.y + "," + d.x + ")"; 
          });

      nodeUpdate.select("circle")
          .attr("r", function(d) {
            if (d.depth === 1 && d._children) {
              return d._children.length * 6;
            } else if (d.depth === 1 && d.children) {
              return d.children.length * 6;
            } else if (d.source) {
              return 12;
            } else if (d.depth === 3)
              return 20;
          })
          .style("fill", function(d) { 
            var dat = d;
            if (d.source == 'twitter') {
              return 'url(/#tile-twit)';
            } else if (d.source == 'nyt') {
              return 'url(/#tile-nyt)';
            } else if (d.source == 'youtube') {
              return 'url(/#tile-youtube)';
            } else if (d.img) {
              defs.append('svg:pattern')
                .attr('id', 'tile-img' + d.id)
                .attr('width', '20')
                .attr('height', '20')
                .append('svg:image')
                .attr('xlink:href', d.img)
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', 40)
                .attr('height', 40)
              return 'url(/#tile-img' + d.id + ')'
            }
            return d._children ? "lightsteelblue" : "#fff"; 
          });

      var nodeExit = node.exit().transition()
          .duration(duration)
          .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
          .remove();

      nodeExit.select("circle")
          .attr("r", 1e-6);

      var link = svg.selectAll("path.link")
          .data(tree.links(nodes), function(d) { return d.target.id; })

      link.enter().insert("svg:path", "g")
          .attr("class", "link")
          .attr("d", function(d) {
            var origin = { x: source.x0, y: source.y0 };
            return diagonal({ source: origin, target: origin });
          })
          .style({
            fill: 'none',
            stroke: '#ccc',
            strokeWidth: '1.5px',
          })
        .transition()
          .duration(duration)
          .attr("d", diagonal)

      link.transition()
          .duration(duration)
          .attr("d", diagonal);

      link.exit().transition()
          .duration(duration)
          .attr("d", function(d) {
            var o = {x: source.x, y: source.y};
            return diagonal({source: o, target: o});
          })
          .remove();

      nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    function toggle(d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      update(root);
    }
  },

});

module.exports = TreeTimeLine; 