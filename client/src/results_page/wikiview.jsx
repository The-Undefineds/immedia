var React = require('react');

var WikiView = React.createClass({
  
  componentDidMount : function(){
    var img,
        searchTerm = this.props.searchTerm,
        context = this,
        searchRequest = "http://en.wikipedia.org/w/api.php?action=cirrus-suggest&text="+searchTerm+"&callback=?&format=json";
    
    $.getJSON(searchRequest)
    .done(function(data){
      var highestScore = 0;
      var searchArea = data.suggest;
      for (var i = 0; i < searchArea.length; i++){
        if (searchArea[i].score > highestScore){
          searchTerm = searchArea[i].title;
          highestScore = searchArea[i].score;
        }
      }
      var parseRequest = "http://en.wikipedia.org/w/api.php?action=parse&format=json&page="+searchTerm+"&redirects&prop=text&callback=?";
      $.getJSON(parseRequest)
      .done(function(data){
        wikiHTML = data.parse.text["*"];
        $wikiDOM = $("<document>"+wikiHTML+"</document>");
        var x = $wikiDOM.find(".infobox");
        console.log(x);
        img = x[0].getElementsByTagName("IMG")[0] || "";
        if (img) img.parentNode.removeChild(img);
        var info = context.processData(x.html());
        $('#wikiview').append(img).append(info);
      })
    });
  },

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
      <div id='wikiview'></div>
    );
  },

  styles: {
    wikiview: {
      float: 'right',
    }
  }

});

module.exports = WikiView;
