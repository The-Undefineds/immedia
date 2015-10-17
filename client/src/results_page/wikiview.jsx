var React = require('react');
var StyleSheet = require('react-style');

var Summary = require('./summary.jsx');
// var Infobox = require('./infobox.jsx');

var styles = StyleSheet.create({
  container: {
    position: 'fixed',
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
    if(this.props.searchTerm === 'immediahomepage'){
      this.setState({
        summary: 'View recent tweets, videos and articles on any topical subject '+
        'in one simple and visually pleasing format.The Immedia Team: <a href="https://github.com/jacksonsierra" target="_blank">Jackson Sierra</a>, ' + 
        '<a href="https://github.com/SlackingPalico" target="_blank">John Joel</a>, <a href="https://github.com/deeparcher" target="_blank">OJ Haugan</a>, ' +
        '<a href="https://github.com/mtcrushmore" target="_blank">Ryan Smith</a>, and <a href="https://github.com/Way2nnadi" target="_blank">Uche Nnadi</a>',
        profileImage: './immedia.png',
      })

      this.forceUpdate()
    }else{
      this.query(this.props.searchTerm);
    } 
  },

  componentWillReceiveProps: function(nextProps){
    if (nextProps.searchTerm === 'immediahomepage'){
      this.setState({
        summary: 'View recent tweets, videos and articles on any topical subject '+
        'in one simple and visually pleasing format.The Immedia Team: <a href="https://github.com/jacksonsierra" target="_blank">Jackson Sierra</a>, ' + 
        '<a href="https://github.com/SlackingPalico" target="_blank">John Joel</a>, <a href="https://github.com/deeparcher" target="_blank">OJ Haugan</a>, ' +
        '<a href="https://github.com/mtcrushmore" target="_blank">Ryan Smith</a>, and <a href="https://github.com/Way2nnadi" target="_blank">Uche Nnadi</a>',
        profileImage: './immedia.png'
      })
    }
    else if (this.props.searchTerm !== nextProps.searchTerm) {
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
          <Summary summary={this.state.summary} profileImage={this.state.profileImage} searchInit={this.props.searchInit} searchTerm={this.props.searchTerm} window={{width: this.state.width, height: this.state.height}}/> 
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

      var profileImage = $infobox[0].getElementsByTagName('img')[0];

      if(profileImage) {
        this.finishParse(infobox, searchTerm, summary, $(profileImage).attr('src').replace('//','https://'));
      } else {
        this.getGoogleImageResult(infobox, searchTerm, summary);
      }
      return;
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

  getGoogleImageResult: function(infobox, searchTerm, summary) {
    $.get('http://localhost:3000/api/googleImages?q=' + searchTerm.replace(/\s/g, '+'))
      .done(function(response) {
        this.finishParse.call(this, infobox, searchTerm, summary, response.image);
      }.bind(this));
  },

  finishParse: function(infobox, searchTerm, summary, img) {
    if(img) {
      this.loadHistoryView.call(this, img);
    } else {
      this.loadHistoryView.call(this);
    }

    $.post('http://localhost:3000/searches/incrementSearchTerm', { searchTerm: searchTerm, img: img });
      
    this.setState({
      infobox: infobox,
      profileImage: img,
      summary: summary,
    });
  },

});

module.exports = WikiView;
