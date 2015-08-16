(function () {
    'use strict';

    function getEl (id) {
        return document.getElementById(id);
    }

    /*
        Visualizer class definition
     */

    function Visualizer(el){
        this.width = 0;
        this.height = 0;
        this.isEnabled = false;
        this.el = el;

        this.init();
    }

    Visualizer.prototype.init = function() {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.smoothingTimeConstant = 0.7;
        this.analyser.fftSize = 1024;
        this.fdata = new Uint8Array(this.analyser.frequencyBinCount);


        this.fitCanvas();
        this.ctx = this.el.getContext('2d');
        this.render();
    };

    Visualizer.prototype.start = function() {
        this.isEnabled = true;
    };

    Visualizer.prototype.stop = function() {
        this.isEnabled = false;
        this.clear();
    };

    Visualizer.prototype.changeSource = function(sourceElem) {
        var source = this.audioCtx.createMediaElementSource(sourceElem);
        source.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);
    };

    Visualizer.prototype.render = function() {
        requestAnimationFrame(this.render.bind(this));

        if (this.isEnabled) {
            this.analyser.getByteFrequencyData(this.fdata);

            this.clear();

            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = 'rgb(128, 128, 128)';
            this.ctx.beginPath();

            var sliceWidth = this.width * 1.0 / this.fdata.length;
            var x = 0;

            for(var i = 0; i < this.fdata.length; i++) {

                var v = this.fdata[i] / 256.0;
                var y = v * this.height;

                if(i === 0) {
                  this.ctx.moveTo(x, y);
                } else {
                  this.ctx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            this.ctx.lineTo(this.width, this.height/2);
            this.ctx.stroke();
        }
    };

    Visualizer.prototype.fitCanvas = function() {
        var dpr = window.devicePixelRatio || 1;

        this.width = this.el.parentNode.clientWidth * dpr;
        this.height = this.el.parentNode.clientHeight * dpr;

        this.el.width = this.width;
        this.el.height = this.height;
    };

    Visualizer.prototype.clear = function() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    };



    /*
        Player class definition
     */

    function Player () {
        this.init();
    }

    Player.prototype.init = function() {
        this.el = {
            audio: getEl('audio'),
            file: getEl('file'),
            play: getEl('play'),
            icoPlay: getEl('icoplay'),
            icoStop: getEl('icostop'),
            visualize: getEl('visualize'),
            canvas: getEl('canvas'),
            dropzone: getEl('dropzone'),
            title: getEl('title')
        }

        this.visualizer = new Visualizer(this.el.canvas);
        this.visualizer.changeSource(this.el.audio);

        this.addHandlers();
    };

    Player.prototype.addHandlers = function() {
        var self = this;

        this.el.file.addEventListener('change', function () {
            self.open(this.files[0]);
        });

        this.el.play.addEventListener('click', function () {
            self.togglePlayStop();
        });

        this.el.audio.addEventListener('error', function () {
            self.error('Some error occured');
        });

        this.el.audio.addEventListener('ended', function () {
            self.stop();
        });

        this.el.dropzone.addEventListener('dragover', function (event) {
            this.classList.add('b-dropzone_visible');
            event.preventDefault();
        });

        this.el.dropzone.addEventListener('dragleave', function (event) {
            this.classList.remove('b-dropzone_visible');
            event.preventDefault();
        });

        this.el.dropzone.addEventListener('dragend', function (event) {
            event.preventDefault();
        });

        this.el.dropzone.addEventListener('drop', function (event) {
            event.preventDefault();

            self.open(event.dataTransfer.files[0]);
        });

        this.el.visualize.addEventListener('click', function () {
            self.toggleVisualization();
        });
    };

    Player.prototype.open = function(file) {
        if (this.el.audio.canPlayType(file.type)) {
            this.setTitle(file);
            this.el.audio.src = URL.createObjectURL(file);
            this.play();

            if (this.visualizer.isEnabled) {
                this.visualizer.start();
            }
        } else {
            this.error('Can\'t play this file');
        }

    };

    Player.prototype.play = function() {
        this.el.icoPlay.style.display = 'none';
        this.el.icoStop.style.display = 'inline';
        this.el.audio.play();
    };

    Player.prototype.stop = function() {
        this.el.icoPlay.style.display = 'inline';
        this.el.icoStop.style.display = 'none';
        this.el.audio.pause();
    };

    Player.prototype.togglePlayStop = function() {
        if (this.el.audio.paused) {
            this.play();
        } else {
            this.stop();
        }
    };

    Player.prototype.setTitle = function(file) {
        this.el.dropzone.classList.remove('b-dropzone_visible');

        var self = this;

        id3(file, function(err, tags) {
            if (!err && /\w+/.test(tags.title) && /\w+/.test(tags.title)) {
                self.el.title.innerHTML = tags.title + ' — ' + tags.artist;
            } else {
                self.el.title.innerHTML = file.name;
            }
        });
    };

    Player.prototype.startVisualize = function() {
        this.el.visualize.classList.remove('b-controls__item_muted');

        this.visualizer.start();
    };

    Player.prototype.stopVisualize = function() {
        this.el.visualize.classList.add('b-controls__item_muted');

        this.visualizer.stop();
    };

    Player.prototype.toggleVisualization = function() {
        if (this.visualizer.isEnabled) {
            this.stopVisualize();
        } else {
            this.startVisualize();
        }
    };

    Player.prototype.error = function(text) {
        alert(text);
    };

    Player.prototype.visualize = function() {



        var frequencyData = new Uint8Array(analyser.frequencyBinCount);

        function renderFrame() {
            requestAnimationFrame(renderFrame);
            analyser.getByteFrequencyData(frequencyData);
            console.log(frequencyData)
        }

        renderFrame();
    };


    new Player();
})();
