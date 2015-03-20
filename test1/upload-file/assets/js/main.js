function d(str) {
  console.log(str);
}

$('#fileupload').fileupload({
  // Uncomment the following to send cross-domain cookies:
  //xhrFields: {withCredentials: true},
  singleFileUploads: false,
  forceIframeTransport: false,
  url: '/upload',
  acceptFileTypes: /(\.|\/)(gif|jpe?g|png|html|css)$/i,
  progress: function(e, data) {
    d(data);
  },
  progressall: function(e, data) {
    d(data);
  },
  fail: function(e, data) {
    d(e);
    d(data);
  }
});333