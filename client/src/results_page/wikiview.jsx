var React = require('react');

var WikiView = React.createClass({
  
  componentDidMount : function(){
    var img;
    var searchTerm = this.prop.data;
    var searchRequest = "http://en.wikipedia.org/w/api.php?action=cirrus-suggest&text="+searchTerm+"&callback=?&format=json";
    
    $.getJSON(url2)
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
      $.getJSON(url)
      .done(function(data){
        wikiHTML = data.parse.text["*"];
        $wikiDOM = $("<document>"+wikiHTML+"</document>");
        var x = $wikiDOM.find(".infobox");
        img = x[0].getElementsByTagName("IMG")[0] || "";
        if (img) img.parentNode.removeChild(img);
        $('#wikiview').append(x.html());
      })
    });
  },
  
  render: function(){
    return (
      <div id='wikiview'></div>
      )
  }

});

module.exports = WikiView;
