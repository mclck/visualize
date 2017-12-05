(function(d, w, u) {
	if (!w.AudioContext) {
		if (!w.webkitAudioContext) {
			alert('no audiocontext found');
		}
		w.AudioContext = w.webkitAudioContext;
	}

	var canvas = d.getElementById("sketch"),
		ctx = canvas.getContext("2d"),
		width = w.innerWidth,
		height = w.innerHeight;

	var audioContext, analyserNode, javascriptNode, sourceNode,
		bufferSize = 1024,
		frequencies = [];

	var tracks = [],
		musicUrl, artistName, musicName, info;

	var frameCount = 0,
		img = new Image(),
		Y = -100,
		echelle,
		sensib = 1.5,
		step = 2;

	function setup() {
		canvas.width = width;
		canvas.height = height;
		echelle = width / bufferSize;

		ctx.fillStyle = "#000";
		ctx.fillRect(0, 0, width, height);

		ctx.strokeStyle = "rgba( 255, 255, 255, 0.1 )";

		setupAudio(bufferSize);
		loadSound('nasty.mp3');
	}
	

	function draw() {
		w.requestAnimationFrame(draw);
		
		if (frameCount % 3 == 0) {
			if (frameCount > 6) ctx.drawImage(img, 0, -2);
			
			if (frameCount % 1200 == 0){
				ctx.fillStyle = "#000";
				ctx.fillRect(0, 0, width, height);
			}

			ctx.fillStyle = "#000";
			ctx.beginPath();
			ctx.moveTo(0, Y + frequencies[0] * sensib);
			for (var i = step; i < bufferSize; i += step) {
				ctx.lineTo(i * echelle, Y + frequencies[i] * sensib);
			}
			ctx.lineTo(width, Y + 100);
			ctx.lineTo(0, Y + 100);
			ctx.closePath();
			ctx.fill();

			for (var i = 1; i < bufferSize - step; i += step) {
				ctx.beginPath();
				ctx.moveTo(i * echelle, Y + frequencies[i] * sensib);
				ctx.lineTo(i + step, Y + frequencies[i + step] * sensib);
				ctx.stroke();
			}

			img.src = d.getElementById("sketch").toDataURL("image/jpeg", 0.95);

			if (info != undefined) {
				ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
				ctx.fillRect(5, height - 30, width - 10, 20);

				ctx.fillStyle = "rgba(150, 150, 150, 1)";
				ctx.fillText(info, 10, height - 15);
			}

			if (Y < height - 300) {
				Y += 2;
			}
		}

		frameCount++;
	}

	function setupAudio(buffSize) {
		audioContext = new AudioContext(); 

		javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);
		javascriptNode.connect(audioContext.destination);

		javascriptNode.onaudioprocess = function() {
			var array = new Uint8Array(analyserNode.frequencyBinCount);
			analyserNode.getByteTimeDomainData(array);
			frequencies = array;
		}

		analyserNode = audioContext.createAnalyser();
		analyserNode.smoothingTimeConstant = 0.3;
		analyserNode.fftSize = buffSize * 2;

		// create a buffer source node
		sourceNode = audioContext.createBufferSource();
		sourceNode.onended = setup;
		sourceNode.connect(analyserNode);
		analyserNode.connect(javascriptNode);

        console.log(sourceNode);

		sourceNode.connect(audioContext.destination);
	}

	// load the specified sound
	function loadSound(url) {
		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.responseType = 'arraybuffer';

		// When loaded decode the data
		request.onload = function() {

			// decode the data
			audioContext.decodeAudioData(request.response, function(buffer) {
				// when the audio is decoded play the sound
				playSound(buffer);
			}, onError);
		}
		request.send();
	}

	function playSound(buffer) {
		sourceNode.buffer = buffer;
		sourceNode.start(0);
	}

	// log if an error occurs
	function onError(e) {
		console.log(e);
	}

	setup();
	draw();
})(document, window, undefined);