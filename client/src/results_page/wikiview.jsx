var React = require('react');

var WikiView = React.createClass({

  query: function(searchTerm){
    var img,
        searchTerm = searchTerm,
        context = this,
        cirrusRequest = "http://en.wikipedia.org/w/api.php?action=cirrus-suggest&text="+searchTerm+"&callback=?&format=json"
        searchRequest = "https://en.wikipedia.org/w/api.php?action=query&prop=pageprops|info&titles="+searchTerm+"&callback=?&format=json";
    
    $('#wikiview').empty();

    $.getJSON(searchRequest)
    .done(function(data){
      console.log(data);
      if ('-1' in data.query.pages) {
        $.getJSON(cirrusRequest)
        .done(function(data){
          var highestScore = 0;
          var searchArea = data.suggest;
          for (var i = 0; i < searchArea.length; i++){
            if (searchArea[i].score > highestScore){
              searchTerm = searchArea[i].title;
              highestScore = searchArea[i].score;
            }
          }
          parse(searchTerm);
        });
      } 
      else {
        parse(searchTerm);
      }
    });
    
    function parse(searchTerm){
      var parseRequest = "http://en.wikipedia.org/w/api.php?action=parse&format=json&page="+searchTerm+"&redirects&prop=text&callback=?";
      $.getJSON(parseRequest)
      .done(function(data){
        wikiHTML = data.parse.text["*"];
        $wikiDOM = $("<document>"+wikiHTML+"</document>");
        var x = $wikiDOM.find(".infobox");
        img = x[0].getElementsByTagName("IMG")[0] || "";
        // if (img) { img.parentNode.removeChild(img) }; // this line removes the image from the info-box
        var info = context.processData(x.html());
        $('#wikiview').append(info);
      })
    }
  },
  
  componentDidMount : function(){
    this.query(this.props.searchTerm);
  },

  componentWillReceiveProps: function(newProps){
    if (this.props.searchTerm !== newProps.searchTerm) {
      this.query(newProps.searchTerm);
    }
  },

  // alters html so that hyperlinks, when clicked, open in new tab
  processData: function(data){
    for (var i = 0; i < data.length; i++) {
      if (data[i] === 'h' && data.slice(i+1, i+4) === 'ref') {
        var string = data;
        if (data.slice(i+6, i+11) === '/wiki') {
          string = string.slice(0, i+6) + 'http://wikipedia.org' + string.slice(i+6);
        }
        string = string.slice(0,i) +  'target="_blank" ' + string.slice(i);
        i += 20;
        data = string; 
      }
    }
    return data;
  },
  
  render: function(){
    return (
      <div id='wikiview' style={this.style}></div>
    );
  },

  style: {
    position: 'fixed',
    left: '900px',
    overflow: 'scroll',
    marginTop: '50px',
    maxHeight: '680px'
  }

});

module.exports = WikiView;
