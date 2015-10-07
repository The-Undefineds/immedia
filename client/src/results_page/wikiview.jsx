var React = require('react');
var StyleSheet = require('react-style');

var styles = StyleSheet.create({
  container: {
    position: 'absolute',
    overflow: 'scroll',
    top: '100px',
    borderLeft: 'solid 1px gray',
    paddingLeft: '15px',
    paddingRight: '5px',
  }
});

var SearchHistory = require('./searchhistory.jsx');

var WikiView = React.createClass({

  getInitialState: function() {
    return {
      width: this.props.window.width,
      height: this.props.window.height,
    };
  },
  
  componentDidMount: function(){
    this.query(this.props.searchTerm);
  },

  componentWillReceiveProps: function(nextProps){
    if (this.props.searchTerm !== nextProps.searchTerm) {
      this.query(nextProps.searchTerm);
    }

    this.setState({
      width: nextProps.window.width,
      height: nextProps.window.height,
    });
  },

  render: function(){
    this.getDynamicStyles();

    return (
      <div id='wikiview' style={styles.container}></div>
    );
  },

  getDynamicStyles: function() {
    styles.container.right = (this.state.width < 1350 ? 0 : (this.state.width - 1350) / 2) + 'px';
    styles.container.width = (this.state.width < 1350 ? 365 * (this.state.width / 1350) : 365) + 'px';
    styles.container.height = (this.state.height - 100 - 150) + 'px';
  },

  // Alters html so that hyperlinks, when clicked, make a new immedia-search
  processData: function(data){
    for (var i = 0; i < data.length; i++) {
      if (data[i] === 'h' && data.slice(i+1, i+4) === 'ref') {
        var string = data;
        if (data.slice(i+6, i+11) === '/wiki') {
          string = string.slice(0, i+6) + 'http://wikipedia.org' + string.slice(i+6);
          for (var j = 0; j < 300; j++) {
            if (string[i + j] !== '>') {
              continue;
            } else {
              break;
            }
          }
          // string = string.slice(0, i + 4) + ' onClick={this.props.searchInit(' + string.slice(i + 12, i + 12 + j) + ')}' + string.slice(i + 32 + j);
          string = string.slice(0, i) + 'class="wikiLink"' + string.slice(i + j);
          }
        // string = string.slice(0,i) +  'target="_blank" ' + string.slice(i);
        // i += 20;
        data = string;
      }
    }
    return data;
  },
  
  query: function(searchTerm){
    var img,
        searchTerm = searchTerm,
        cirrusRequest = "http://en.wikipedia.org/w/api.php?action=cirrus-suggest&text="+searchTerm+"&callback=?&format=json"
        searchRequest = "https://en.wikipedia.org/w/api.php?action=query&prop=pageprops|info&titles="+searchTerm+"&callback=?&format=json";
    
    $('#wikiview').empty();

    $.getJSON(searchRequest)
    .done(function(data){
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
          this.parse.call(this, searchTerm);
        }.bind(this));
      } else {
        this.parse.call(this, searchTerm);
      }
    }.bind(this));
  },

  parse: function(searchTerm) {
    var parseRequest = "http://en.wikipedia.org/w/api.php?action=parse&format=json&page="+searchTerm+"&redirects&prop=text&callback=?";
    $.getJSON(parseRequest)
    .done(function(data){
      wikiHTML = data.parse.text["*"];
      $wikiDOM = $("<document>" + wikiHTML + "</document>");
      var $infobox = $wikiDOM.find(".infobox");
      var $overview = $wikiDOM.children('p').first();
      // 'if/else', here, ensures that a wikipedia page deficient of a '.infobox' does not cause any errors
      if ($infobox[0]) {
        img = $infobox[0].getElementsByTagName("IMG")[0] || "";
        this.loadHistoryView.call(this, img);
        var info = this.processData.call(this, $infobox.html());
        var summary = this.processData.call(this, $overview.html());
        $('#wikiview').append(info);
        $('#wikiview').append(summary);
        $('.wikiLink').on('click', function() {
          this.props.searchInit($(this).text());
        }.bind(this));
      } else {
        this.loadHistoryView.call(this);
      }
    }.bind(this));
  },

  loadHistoryView: function(img){
    // Add image for the search-history view (rendered below)
    var history = JSON.parse(localStorage['immedia']);
    if (img) {
      history[0].img = img.src;
    } else { // No argument passed is the signal that no image was found
      history[0].img = 'https://upload.wikimedia.org/wikipedia/commons/f/fc/No_picture_available.png';
    }
    localStorage['immedia'] = JSON.stringify(history);
  },

});

module.exports = WikiView;
