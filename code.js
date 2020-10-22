(function () {
        
        var url = 'http://0.0.0.0:5000/image'; 
        var width = 1080; // We will scale the photo width to this
        var height = 0; // This will be computed based on the input stream

        var streaming = false;

        var video = null;
        var canvas = null;
        var photo = null;
        var startbutton = null;
        var endbutton = null;
        var seconds = 10;
        var stop = false;

        function startup() {
            video = document.getElementById('video');
            canvas = document.getElementById('canvas');
            photo = document.getElementById('photo');
            startbutton = document.getElementById('startbutton');
            endbutton = document.getElementById('endbutton');

            // Get permission and stream video
            navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false
                })
                .then(function(stream) {
                    video.srcObject = stream;
                    video.play();
                })
                .catch(function(err) {
                    console.log("An error occurred: " + err);
                });
            
            // When Enough data is available to show frames    
            video.addEventListener('canplay', function(ev) {
                if (!streaming) {
                    height = video.videoHeight / (video.videoWidth / width);

                    if (isNaN(height)) {
                        height = width / (4 / 3);
                    }

                    video.setAttribute('width', width);
                    video.setAttribute('height', height);
                    canvas.setAttribute('width', width);
                    canvas.setAttribute('height', height);
                    streaming = true;
                }
            }, false);

            // Start App
            startbutton.addEventListener('click', function(ev) {
                takepicture();
                ev.preventDefault();
            }, false);

            // Stop App
            endbutton.addEventListener('click', function(ev) {
                stop = true;
                console.log("Stopped");
                ev.preventDefault();
            }, false); 

        }

        function make_request(data) {
            const D = {
                image: data
            };
    
            console.log(D);
    
            fetch(url, {
                    method: 'POST',
                    body: JSON.stringify(D),
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8'
                    }
            }).then(response => {
                console.log(response);
            })
            
        }
    
        function takepicture() {
            console.log('Picture taken', stop);
            var context = canvas.getContext('2d');
            if (width && height) {
                canvas.width = width;
                canvas.height = height;
                context.drawImage(video, 0, 0, width, height);
                var data = canvas.toDataURL('image/png').split(';base64,')[1];;
                make_request(data);
            }
            
            // Repeating Requests
            if(!stop) {
                setTimeout(takepicture, seconds*1000);
            }
        }
    
    

        window.addEventListener('load', startup, false);
})();