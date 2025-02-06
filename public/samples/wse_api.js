function sendGetRequest(app,stream,attempt=1)
{
  console.log("Sending ad insert attempt:"+attempt);
  $('#response').text("...");
  var adObject = new Object();
  adObject.id = app + "-ad";
  adObject.start_date = "+10";
  adObject.asset_list = "https://vast2sgai.qualabs.com/samples/api/asset-list?vasturl=http://localhost:3000/samples/sample-api-vastid-live/vast-sample.xml&test=false&user=user&content=content"

  $.post({
    url: 'https://demo.entrypoint.cloud.wowza.com/v1/ads/applications/'+app+'/streams/' + stream,
    type: 'post',
    timeout: 2000,
    tryCount : 0,
    retryLimit : 3,
    dataType: 'json',
    contentType: "application/json",
    data: JSON.stringify(adObject),
    success: function (okdata) {
      msg = "OK:"+okdata;
      console.log(msg);
      $('#response').text(msg);      
    },
    error: function (xhr, ajaxOptions, thrownError) {
      if(xhr.status == 0) {
        var msg = "insert failed:" + xhr.status + "=>" + xhr.responseText + " (attempt:" + attempt + ")"
        $('#response').text(msg);
        console.log(msg);
        if(attempt < 2) {
          console.log("Retyring");
          sendGetRequest(app,stream,attempt+1);
        } else {
          $('#response').text(msg);      
        }
      } else if(xhr.status == 200) {
        msg = "insert ok:" + xhr.status + "=>" + xhr.responseText;
        console.log(msg);
        $('#response').text(msg);
      }
      else {
        msg = "insert failed:" + xhr.status + "=>" + xhr.responseText;
        console.log(msg);
        $('#response').text(msg);
      }
    }
  });
};

function sendDeleteRequest(app,stream,attempt=1)
{
  console.log("Sending ad remove attempt:"+attempt);
  $('#response').text("...");
  var adObject = new Object();
  $.post({
    url: 'https://demo.entrypoint.cloud.wowza.com/v1/ads/applications/'+app+'/streams/' + stream,
    type: 'delete',
    dataType: 'json',
    timeout: 2000,
    tryCount : 0,
    retryLimit : 3,    
    contentType: "application/json",
    data: JSON.stringify(adObject),
    success: function (okdata) {
      msg = "Deleted";
      console.log(msg);
      $('#response').text(msg);      
    },
    error: function (xhr, ajaxOptions, thrownError) {
      if(xhr.status == 0) {
        msg = "delete failed:" + xhr.status + "=>" + xhr.responseText + " (attempt:" + attempt + ")";
        console.log(msg);
        if(attempt < 2) {
          console.log("trying...");
          sendDeleteRequest(app,stream,attempt+1);
        } else {
          $('#response').text(msg);      
        }
      } else if(xhr.status == 204) {
        msg = "delete ok:" + xhr.status + "=>" + xhr.responseText;
        console.log(msg);
        $('#response').text(msg);      
      }
      else {
        msg = "delete failed:" + xhr.status + "=>" + xhr.responseText;
        console.log(msg);
        $('#response').text(msg);
      }
    }
  });
}    

function checkTime(i) {
  // add a zero in front of numbers<10
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

function startTime() {
  var today = new Date();
  $('#time').text(checkTime(today.getUTCHours()) + ":" + checkTime(today.getUTCMinutes()) + ":" + checkTime(today.getUTCSeconds()));

  if (hls && hls.playingDate){
    var programDateTime = hls.playingDate
    $('#program-date-time').text(checkTime(programDateTime.getUTCHours()) + ":" + checkTime(programDateTime.getUTCMinutes()) + ":" + checkTime(programDateTime.getUTCSeconds()));
  }
  setTimeout(function() {
    startTime()
  }, 500);
}