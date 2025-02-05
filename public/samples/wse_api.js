function sendGetRequest(app,stream)
{
  console.log("Sending ad insert");
  $('#response').text("...");
  var adObject = new Object();
  adObject.id = app + "-ad";

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
        console.log("insert failed:" + xhr.status + "=>" + xhr.responseText);
        console.log("Retyring");
        sendGetRequest(app,stream);
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

function sendDeleteRequest(app,stream)
{
  console.log("Sending ad remove");
  $('#response').text("...");
  var adObject = new Object();
  $.post({
    url: 'https://demo.entrypoint.cloud.wowza.com/v1/ads/applications/'+app+'/streams/' + stream + "/delete",
    type: 'post',
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
        msg = "delete failed:" + xhr.status + "=>" + xhr.responseText;
        console.log(msg);
        $('#response').text(msg);      
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