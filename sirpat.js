(function () {
'use strict';

function showStatus(message) {
    var status = document.getElementById('dashboard-status');
    status.textContent = message;
    status.className = 'alert alert-warning';
    status.hidden = false;
}

// Explicit data names avoid the browser global created by table id="sirpattweets".
var tweets = window.sirpatArchiveTweets;
if (!Array.isArray(tweets) || tweets.length === 0) {
    showStatus('The archive data could not be loaded. Please check that data/sirpattweets.js was uploaded beside this page, then reload.');
    return;
}

var validData = tweets.every(function (tweet) {
    return tweet && typeof tweet.id === 'string' && /^\d+$/.test(tweet.id) &&
        typeof tweet.created_at === 'string' && /^\d{4}-\d{2}-\d{2}/.test(tweet.created_at) &&
        Number.isFinite(Date.parse(tweet.created_at.substring(0, 10) + 'T00:00:00Z')) &&
        typeof tweet.text === 'string' && /^\d+$/.test(String(tweet.favorite_count)) &&
        /^\d+$/.test(String(tweet.retweet_count)) &&
        tweet.twitter_url === 'https://twitter.com/SirPatStew/status/' + tweet.id;
});
if (!validData) {
    showStatus('The archive data is incomplete or invalid. Please restore the supplied data/sirpattweets.js file, then reload.');
    return;
}
if (typeof window.jQuery !== 'function') {
    showStatus('A display library could not be loaded. Please check your internet connection or content blocker, then reload.');
    return;
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[character];
    });
}

//////////////////////
// TABLE OF TWEETS

var sirpattweets_table = tweets.slice(0);
// Compare ID strings without losing precision on Twitter's 64-bit IDs.
sirpattweets_table.sort(function (a, b) {
    return b.id.length - a.id.length || (a.id < b.id ? 1 : a.id > b.id ? -1 : 0);
});

//console.log(JSON.stringify(sirpattweets_table));

$(document).ready(function () {
    var thead;
    var thead_tr;
    thead = $("<thead>");
    thead_tr = $("<tr/>");
    thead_tr.append("<th style='width: 10%' data-sortinitialorder='asc'>Date</th>");
    thead_tr.append("<th style='text-align: center'>Sonnet</th>");
    thead_tr.append("<th style='text-align: center'>Link</th>");
    thead_tr.append("<th style='text-align: right'>Likes</th>");
    thead_tr.append("<th style='text-align: right'>Retweets</th>");
    thead_tr.append("<th>Tweet</th>");
    thead_tr.append("</tr>");
    thead.append(thead_tr);
    $('#sirpattweets').append(thead);
    var tbody;
    var tbody_tr;
    tbody = $("<tbody>");
    $('#sirpattweets').append(tbody);
    for(var i = 0; i < sirpattweets_table.length; i++) {
        var obj = sirpattweets_table[i];
        tbody_tr = $('<tr/>');
        
        tbody_tr.append("<td>" + obj.created_at.substring(0, 10) + "</td>");
        tbody_tr.append("<td style='text-align: center'>" + getSonnetNumber(obj.text) + "</td>");
        tbody_tr.append("<td style='text-align: center'><a href='" + obj.twitter_url + "' target='blank'>link</a></td>");
        tbody_tr.append("<td style='text-align: right'>" + parseInt(obj.favorite_count).toLocaleString() + "</td>");
        tbody_tr.append("<td style='text-align: right'>" + parseInt(obj.retweet_count).toLocaleString() + "</td>");
        tbody_tr.append("<td>" + escapeHtml(obj.text) + "</td>");
        tbody.append(tbody_tr);
    }
});

function getSonnetNumber(text) {
    var res = /Sonnet (\d+)/.exec(text) || /Sonnets (\d+)/.exec(text) || /Number (\d+)/.exec(text) || /Sonnets (\d+)/.exec(text);
    return (res !== null) ? res[1] : 'Intermission';
}

// add tablesorter js to allow user to sort table by column headers
$(document).ready(function($){ 
    if (typeof $.fn.tablesorter === 'function') {
        $("#sirpattweets").tablesorter({});
    } else {
        showStatus('The archived data is available, but the table-sorting library could not load. Please reload to enable column sorting.');
    }
}); 

//////////////////////
// CHART OF TWEET LIKE AND RETWEETS

var sonnets = [];
var likes = [];
var retweets = [];
var totalLikes = 0;
var totalRetweeets = 0;

for(var i = 0; i < tweets.length; i++) {
    var obj = tweets[i];
    if (getSonnetNumber(obj.text) !== 'Intermission') {
        sonnets.push(getSonnetNumber(obj.text));
        likes.push(obj.favorite_count);
        retweets.push(obj.retweet_count);
        totalLikes += parseInt(obj.favorite_count);
        totalRetweeets += parseInt(obj.retweet_count);
    }
}

document.getElementById('totals').innerHTML = 'Historical totals for charted sonnet tweets in this partial archive: <br>Likes = ' + totalLikes.toLocaleString() + '<br>Retweets = ' + totalRetweeets.toLocaleString();

if (typeof window.sirpatArchiveUpdated === 'string') {
    document.getElementById('lastupdate').textContent = window.sirpatArchiveUpdated;
}

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

if (window.Plotly && typeof window.Plotly.newPlot === 'function') {
    try {
        var plot = window.Plotly.newPlot('chart', data, layout, config);
        if (plot && typeof plot.catch === 'function') {
            plot.catch(function () { showStatus('The chart could not be drawn. The archived tweet table is still available below.'); });
        }
    } catch (error) {
        showStatus('The chart could not be drawn. The archived tweet table is still available below.');
    }
} else {
    showStatus('The chart library could not load. The archived tweet table is still available below; please reload to retry the chart.');
}
})();

