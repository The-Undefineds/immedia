var React = require('react');
var StyleSheet = require('react-style');

var Summary = require('./summary.jsx');
// var Infobox = require('./infobox.jsx');

var styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '60px',
    paddingLeft: '15px',
    paddingRight: '5px',
    textAlign: 'center',
  },
});

var SearchHistory = require('./searchhistory.jsx');

var WikiView = React.createClass({

  getInitialState: function() {
    return {
      width: this.props.window.width,
      height: this.props.window.height,
      summaryView: true,
      summary: '',
      profileImage: '',
      infobox: '',
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
      <div id='wikiview' style={styles.container}>
        { this.state.summaryView ? 
          <Summary summary={this.state.summary} profileImage={this.state.profileImage} searchTerm={this.props.searchTerm} window={{width: this.state.width, height: this.state.height}}/> 
          : null }
      </div>
    );
  },

  getDynamicStyles: function() {
    styles.container.right = (this.state.width < 1350 ? 0 : (this.state.width - 1350) / 2) + 'px';
    styles.container.width = (this.state.width < 1350 ? 365 * (this.state.width / 1350) : 365) + 'px';
    styles.container.height = (this.state.height - 55 - 150) + 'px';
  },
  
  query: function(searchTerm){
    var img,
        searchTerm = searchTerm,
        cirrusRequest = "http://en.wikipedia.org/w/api.php?action=cirrus-suggest&text="+searchTerm+"&callback=?&format=json"
        searchRequest = "https://en.wikipedia.org/w/api.php?action=query&prop=pageprops|info&titles="+searchTerm+"&callback=?&format=json";
    
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
    var profileImage;
    var parseRequest = "http://en.wikipedia.org/w/api.php?action=parse&format=json&page="+searchTerm+"&redirects&prop=text&callback=?";
    $.getJSON(parseRequest)
    .done(function(data){
      var wikiHTML = data.parse.text["*"];
      var $wikiDOM = $("<document>" + wikiHTML + "</document>");

      var $infobox = $wikiDOM.find(".infobox");
      var infobox = $infobox.html().replace(/href=".*?"/g, 'class="wikiLink"');

      var $summary = $wikiDOM.children('p').first();
      var summary = $summary.html().replace(/href=".*?"/g, 'class="wikiLink"');
      
      var profileImage = $($wikiDOM[0].getElementsByTagName('img')[0]).attr('src').replace('//','https://') || '';  // Add fallback Google Image request here
      var historyImage = $($infobox[0].getElementsByTagName('img')[0]).attr('src').replace('//','https://') || '';  // Add fallback Google Image request here
      historyImage ? this.loadHistoryView.call(this, historyImage) : this.loadHistoryView.call(this);

      $.post('http://127.0.0.1:3000/searches/incrementSearchTerm', { searchTerm: searchTerm, img: profileImage });
      
      this.setState({
        infobox: infobox,
        profileImage: profileImage,
        summary: summary,
      });

    }.bind(this));  
  },

  loadHistoryView: function(img){
    // Add image for the search-history view
    var history = JSON.parse(localStorage['immedia']);
    if (img) {
      history[0].img = img;
    } else { // No argument passed is the signal that no image was found
      history[0].img = 'https://upload.wikimedia.org/wikipedia/commons/f/fc/No_picture_available.png';
    }
    localStorage['immedia'] = JSON.stringify(history);
  },

});

module.exports = WikiView;
