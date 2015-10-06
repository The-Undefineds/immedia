var React = require('react');
var StyleSheet = require('react-style');

var styles = StyleSheet.create({
  container: {
    position: 'absolute',
    overflow: 'scroll',
    top: '100px',
    borderLeft: 'solid 1px gray',
    paddingLeft: '15px',
    paddingRight: '15px',
  },

  wikiLink: {
    color: 'blue',
    cursor: 'pointer',
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

  getDynamicStyles: function() {
    // var $previewContent = $('#previewContent');
    // if($previewContent !== undefined) {
    //   // styles.container.right = this.state.width - (($previewContent.position()).left + $previewContent.width());
    //   // styles.container.width = this.state.width - (($previewContent.position()).left + $previewContent.width());
    // } else {
      styles.container.left = this.state.width - (this.state.width - 1350 < 0 ? (365 * (this.state.width / 1350)) : ((this.state.width - 1350) / 2 + 365)) + 'px';
      styles.container.width = (this.state.width - 1350 < 0 ? 365 * (this.state.width / 1350) : 365) + 'px';
    // }
    styles.container.height = (this.state.height - 100) + 'px';
  },

  //Alters all links in wiki-view to revert to a new Immedia query of the linked term
  processData: function(data){
    var component = this;
    for (var i = 0; i < data.length; i++) {
      if (data[i] === 'h' && data.slice(i+1, i+4) === 'ref') {
        var string = data;
        if (data.slice(i+6, i+11) === '/wiki') {
          // if (data.slice(i+12, i+16) == 'File') { return; }
            string = string.slice(0, i+6) + 'http://wikipedia.org' + string.slice(i+6);
            for (var j = 0; j < 300; j++) {
              if (string[i + j] !== '>') {
                continue;
              } else {
                break;
              }
            }
          // string = string.slice(0, i + 4) + ' onClick={this.props.searchInit(' + string.slice(i + 12, i + 12 + j) + ')}' + string.slice(i + 32 + j);
          string = string.slice(0, i) + 'style={styles.wikiLink} ' + string.slice(i + j);
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
        context = this,
        cirrusRequest = "http://en.wikipedia.org/w/api.php?action=cirrus-suggest&text="+searchTerm+"&callback=?&format=json"
        searchRequest = "https://en.wikipedia.org/w/api.php?action=query&prop=pageprops|info&titles="+searchTerm+"&callback=?&format=json";
    
    $('#wikiview').empty();
    var component = this;

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
          parse(searchTerm);
        });
      } 
      else {
        parse(searchTerm);
      }
    });

    function loadHistoryView(img){
      //Add image for the search-history view (rendered below)
      var history = JSON.parse(localStorage['immedia']);
      if (img) {
        history[0].img = img.src;
      } else { // No argument passed is the signal that no image was found
        history[0].img = 'https://upload.wikimedia.org/wikipedia/commons/f/fc/No_picture_available.png';
      }
      localStorage['immedia'] = JSON.stringify(history);

      // Rendering the search-history view with the history pulled from localStorage
      React.render(
        <SearchHistory history={history} searchInit={context.props.searchInit} />,
        document.getElementById('pastSearches')
      );
    };
    
    function parse(searchTerm){
      var parseRequest = "http://en.wikipedia.org/w/api.php?action=parse&format=json&page="+searchTerm+"&redirects&prop=text&callback=?";
      $.getJSON(parseRequest)
      .done(function(data){
        wikiHTML = data.parse.text["*"];
        $wikiDOM = $("<document>" + wikiHTML + "</document>");
        var x = $wikiDOM.find(".infobox");
        var y = $wikiDOM.find("p:first-of-type:not(.infobox>p)");
        // 'if/else', here, ensures that a wikipedia page deficient of a '.infobox' does not cause any errors
        if (x[0]) {
          img = x[0].getElementsByTagName("IMG")[0] || "";
          loadHistoryView(img);
        } else {
          loadHistoryView();
        }
        // if (img) { img.parentNode.removeChild(img) }; // this line removes the image from the info-box
        var info = context.processData(x.html());
        var summary = context.processData(y.html());
        $('#wikiview').append(info);
        $('#wikiview').append(summary);
        $('.wikiLink').on('click', function() {
          component.props.searchInit($(this).text());
        })
      })
    }
  },
  
  render: function(){
    this.getDynamicStyles();

    return (
      <div id='wikiview' style={styles.container}></div>
    );
  },


});

module.exports = WikiView;
