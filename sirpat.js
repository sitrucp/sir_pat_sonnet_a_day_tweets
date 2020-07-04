
//////////////////////
// TABLE OF TWEETS
    
$(document).ready(function () {
    var thead;
    var thead_tr;
    thead = $("<thead>");
    thead_tr = $("<tr/>");
    thead_tr.append("<th style='width: 10%'>Date</th>");
    thead_tr.append("<th style='text-align: center'>Sonnet</th>");
    thead_tr.append("<th style='text-align: center'>Link</th>");
    thead_tr.append("<th style='text-align: right'>Likes</th>");
    thead_tr.append("<th style='text-align: right'>Retweets</th>");
    thead_tr.append("<th>Tweet</th>");
    thead_tr.append("</tr>");
    thead.append(thead_tr);
    $('table').append(thead);
    var tbody;
    var tbody_tr;
    tbody = $("<tbody>");
    $('table').append(tbody);
    for(var i = 0; i < sirpattweets.length; i++) {
        var obj = sirpattweets[i];
        tbody_tr = $('<tr/>');
        
        tbody_tr.append("<td>" + new Date(obj.created_at).toISOString().substring(0, 10) + "</td>");
        tbody_tr.append("<td style='text-align: center'>" + getSonnetNumber(obj.text) + "</td>");
        tbody_tr.append("<td style='text-align: center'><a href='" + obj.twitter_url + "' target='blank'>link</a></td>");
        tbody_tr.append("<td style='text-align: right'>" + parseInt(obj.favorite_count).toLocaleString() + "</td>");
        tbody_tr.append("<td style='text-align: right'>" + parseInt(obj.retweet_count).toLocaleString() + "</td>");
        tbody_tr.append("<td>" + obj.text + "</td>");
        tbody.append(tbody_tr);
    }
});

function getSonnetNumber(text) {
    var res = /Sonnet (\d+)/.exec(text) || /Sonnets (\d+)/.exec(text) || /Number (\d+)/.exec(text) || /Sonnets (\d+)/.exec(text);
    return (res !== null) ? res[1] : 'Intermission';
}

// add tablesorter js to allow user to sort table by column headers
$(document).ready(function($){ 
    $("#sirpattweets").tablesorter();
}); 

//////////////////////
// CHART OF TWEET LIKE AND RETWEETS

var sonnets = [];
var likes = [];
var retweets = [];
var totalLikes = null
var totalRetweeets = null;
for(var i = 0; i < sirpattweets.length; i++) {
    var obj = sirpattweets[i];
    if (getSonnetNumber(obj.text) !== 'Intermission') {
        sonnets.push(getSonnetNumber(obj.text));
        likes.push(obj.favorite_count);
        retweets.push(obj.retweet_count);
        totalLikes += parseInt(obj.favorite_count);
        totalRetweeets += parseInt(obj.retweet_count);
    }
}

document.getElementById('totals').innerHTML = 'Totals for all ASonnetADay Tweets: <br>Likes = ' + totalLikes.toLocaleString() + '<br>Retweets = ' + totalRetweeets.toLocaleString();

document.getElementById('lastupdate').innerHTML = last_update_date;

var trace1 = {
  type: 'scatter',
  x: sonnets,
  y: likes,
  mode: 'markers',
  name: 'Likes',
  marker: {
    color: 'rgba(156, 165, 196, 0.95)',
    line: {
      color: 'rgba(156, 165, 196, 1.0)',
      width: 1,
    },
    symbol: 'circle',
    size: 10
  }
};

var trace2 = {
    x: sonnets,
    y: retweets,
  mode: 'markers',
  name: 'Retweets',
  marker: {
    color: 'rgba(204, 204, 204, 0.95)',
    line: {
      color: 'rgba(217, 217, 217, 1.0)',
      width: 1,
    },
    symbol: 'circle',
    size: 10
  }
};

var data = [trace1, trace2];

var layout = {
  title: {
      text: 'Like and Retweet Count By Sonnet Number',
      font: {
        size: 11,
        color: '#333',
      },
      y: 1.0,
      x: 0.5,
      xanchor: 'center',
      yanchor: 'top'
  },
  xaxis: {
    title: {
        text: 'Sonnet Number',
        font: {
          size: 11,
        }
      },
    tickangle: -45,
    showticklabels: true,
    type: 'category',
    zeroline: false,
    showgrid: true,
    showline: false,
    titlefont: {
      font: {
        color: 'rgb(204, 204, 204)'
      }
    },
    tickfont: {
        size: 10,
      font: {
        color: 'rgb(102, 102, 102)'
      }
    },
    //autotick: true,
    //dtick: 10,
    ticks: 'outside',
    tickcolor: 'rgb(102, 102, 102)'
  },
  yaxis: {
    title: {
        text: 'Count',
        font: {
          size: 11,
        }
      },
    showgrid: false,
    gridcolor: 'rgb(102, 102, 102)',
    gridwidth: 1,
    showline: false,
    tickfont: {
        size: 10
    }
  },
  margin: {
    l: 40,
    r: 10,
    b: 80,
    t: 40
  },
  legend: {
    "orientation": "h",
    x: .5,
    y: 1.1,
    yanchor: 'top',
    xanchor: 'center',
    bgcolor: 'rgba(0,0,0,0)',
    font: {
      size: 10,
    },
  },

  hovermode: 'closest'
};

var config = {
    displayModeBar: false,
    responsive: true
};

Plotly.newPlot('chart', data, layout,config);

