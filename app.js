(function () {
        
    var url = 'http://127.0.0.1:5000/drive'; 
    var width = 1080; // We will scale the photo width to this
    var height = 0; // This will be computed based on the input stream

    var streaming = false;

    var video = null;
    var canvas = null;
    var photo = null;
    var startbutton = null;
    var icon;
    var seconds = 10;

    var stopped = true;

    var resultShower;
    var audio;

    function startup() {
        video = document.getElementById('video');
        canvas = document.getElementById('canvas');
        photo = document.getElementById('photo');
        startbutton = document.getElementById('startbutton');
        endbutton = document.getElementById('endbutton');
        icon = document.getElementById('start_stop');
        resultShower = document.getElementById('pred');
        audio = document.getElementById("audio"); 

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
            if(stopped) {
                stopped = false;
                icon.innerHTML = 'stop';
                takepicture();
                ev.preventDefault();
            } else {
                stopped = true;
                console.log("Stopped");
                icon.innerHTML = 'play_arrow';
            }
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
        }).then(response => response.text())
        .then(data => {
            pred = JSON.parse(data);
            resultShower.innerHTML = pred.prediction;
            if (pred.prediction === "unsafe") {
                audio.play();
            }
            console.log(data);
        });
        
    }

    function takepicture() {
        var context = canvas.getContext('2d');
        if (width && height) {
            canvas.width = width;
            canvas.height = height;
            context.drawImage(video, 0, 0, width, height);
            var data = canvas.toDataURL('image/png').split(';base64,')[1];;
            make_request(data);
        }
        
        // Repeating Requests
        if(!stopped) {
            setTimeout(takepicture, seconds*1000);
        }
    }



    window.addEventListener('load', startup, false);
})();
