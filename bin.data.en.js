
  if (!Module.expectedDataFileDownloads) {
    Module.expectedDataFileDownloads = 0;
  }

  Module.expectedDataFileDownloads++;
  (function() {
    // Do not attempt to redownload the virtual filesystem data when in a pthread or a Wasm Worker context.
    if (Module['ENVIRONMENT_IS_PTHREAD'] || Module['$ww']) return;
    var loadPackage = function(metadata) {

      var PACKAGE_PATH = '';
      if (typeof window === 'object') {
        PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
      } else if (typeof process === 'undefined' && typeof location !== 'undefined') {
        // web worker
        PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) + '/');
      }
      var PACKAGE_NAME = 'bin.data.en._.js';
      var REMOTE_PACKAGE_BASE = 'bin.data.en._.js';
      if (typeof Module['locateFilePackage'] === 'function' && !Module['locateFile']) {
        Module['locateFile'] = Module['locateFilePackage'];
        err('warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)');
      }
      var REMOTE_PACKAGE_NAME = Module['locateFile'] ? Module['locateFile'](REMOTE_PACKAGE_BASE, '') : REMOTE_PACKAGE_BASE;
var REMOTE_PACKAGE_SIZE = metadata['remote_package_size'];

      function fetchRemotePackage(packageName, packageSize, callback, errback) {
        if (typeof process === 'object' && typeof process.versions === 'object' && typeof process.versions.node === 'string') {
          require('fs').readFile(packageName, function(err, contents) {
            if (err) {
              errback(err);
            } else {
              callback(contents.buffer);
            }
          });
          return;
        }
        var xhr = new XMLHttpRequest();
        xhr.open('GET', packageName, true);
        xhr.responseType = 'arraybuffer';
        xhr.onprogress = function(event) {
          var url = packageName;
          var size = packageSize;
          if (event.total) size = event.total;
          if (event.loaded) {
            if (!xhr.addedTotal) {
              xhr.addedTotal = true;
              if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
              Module.dataFileDownloads[url] = {
                loaded: event.loaded,
                total: size
              };
            } else {
              Module.dataFileDownloads[url].loaded = event.loaded;
            }
            var total = 0;
            var loaded = 0;
            var num = 0;
            for (var download in Module.dataFileDownloads) {
            var data = Module.dataFileDownloads[download];
              total += data.total;
              loaded += data.loaded;
              num++;
            }
            total = Math.ceil(total * Module.expectedDataFileDownloads/num);
            if (Module['setStatus']) Module['setStatus'](`Downloading data... (${loaded}/${total})`);
          } else if (!Module.dataFileDownloads) {
            if (Module['setStatus']) Module['setStatus']('Downloading data...');
          }
        };
        xhr.onerror = function(event) {
          throw new Error("NetworkError for: " + packageName);
        }
        xhr.onload = function(event) {
          if (xhr.status == 200 || xhr.status == 304 || xhr.status == 206 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            var packageData = xhr.response;
            callback(packageData);
          } else {
            throw new Error(xhr.statusText + " : " + xhr.responseURL);
          }
        };
        xhr.send(null);
      };

      function handleError(error) {
        console.error('package error:', error);
      };

      var fetchedCallback = null;
      var fetched = Module['getPreloadedPackage'] ? Module['getPreloadedPackage'](REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE) : null;

      if (!fetched) fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
        if (fetchedCallback) {
          fetchedCallback(data);
          fetchedCallback = null;
        } else {
          fetched = data;
        }
      }, handleError);

    function runWithFS() {

      function assert(check, msg) {
        if (!check) throw msg + new Error().stack;
      }
Module['FS_createPath']("/", "SOUND", true, true);

      /** @constructor */
      function DataRequest(start, end, audio) {
        this.start = start;
        this.end = end;
        this.audio = audio;
      }
      DataRequest.prototype = {
        requests: {},
        open: function(mode, name) {
          this.name = name;
          this.requests[name] = this;
          Module['addRunDependency'](`fp ${this.name}`);
        },
        send: function() {},
        onload: function() {
          var byteArray = this.byteArray.subarray(this.start, this.end);
          this.finish(byteArray);
        },
        finish: function(byteArray) {
          var that = this;
          // canOwn this data in the filesystem, it is a slide into the heap that will never change
          Module['FS_createDataFile'](this.name, null, byteArray, true, true, true);
          Module['removeRunDependency'](`fp ${that.name}`);
          this.requests[this.name] = null;
        }
      };

      var files = metadata['files'];
      for (var i = 0; i < files.length; ++i) {
        new DataRequest(files[i]['start'], files[i]['end'], files[i]['audio'] || 0).open('GET', files[i]['filename']);
      }

      function processPackageData(arrayBuffer) {
        assert(arrayBuffer, 'Loading data file failed.');
        assert(arrayBuffer.constructor.name === ArrayBuffer.name, 'bad input to processPackageData');
        var byteArray = new Uint8Array(arrayBuffer);
        var curr;
        // Reuse the bytearray from the XHR as the source for file reads.
          DataRequest.prototype.byteArray = byteArray;
          var files = metadata['files'];
          for (var i = 0; i < files.length; ++i) {
            DataRequest.prototype.requests[files[i].filename].onload();
          }          Module['removeRunDependency']('datafile_bin.data.en._.js');

      };
      Module['addRunDependency']('datafile_bin.data.en._.js');

      if (!Module.preloadResults) Module.preloadResults = {};

      Module.preloadResults[PACKAGE_NAME] = {fromCache: false};
      if (fetched) {
        processPackageData(fetched);
        fetched = null;
      } else {
        fetchedCallback = processPackageData;
      }

    }
    if (Module['calledRun']) {
      runWithFS();
    } else {
      if (!Module['preRun']) Module['preRun'] = [];
      Module["preRun"].push(runWithFS); // FS is not initialized yet, wait for it
    }

    }
    loadPackage({"files": [{"filename": "/CADET.BMP", "start": 0, "end": 15484}, {"filename": "/CADET.DAT", "start": 15484, "end": 4073625}, {"filename": "/CADET.EXE", "start": 4073625, "end": 4715673}, {"filename": "/SOUND/SOUND1.WAV", "start": 4715673, "end": 4771067}, {"filename": "/SOUND/SOUND104.WAV", "start": 4771067, "end": 4772197}, {"filename": "/SOUND/SOUND105.WAV", "start": 4772197, "end": 4774069}, {"filename": "/SOUND/SOUND12.WAV", "start": 4774069, "end": 4778269}, {"filename": "/SOUND/SOUND131.WAV", "start": 4778269, "end": 4779463}, {"filename": "/SOUND/SOUND14.WAV", "start": 4779463, "end": 4782369}, {"filename": "/SOUND/SOUND16.WAV", "start": 4782369, "end": 4783319}, {"filename": "/SOUND/SOUND17.WAV", "start": 4783319, "end": 4785313}, {"filename": "/SOUND/SOUND18.WAV", "start": 4785313, "end": 4789202}, {"filename": "/SOUND/SOUND19.WAV", "start": 4789202, "end": 4794335}, {"filename": "/SOUND/SOUND20.WAV", "start": 4794335, "end": 4802888}, {"filename": "/SOUND/SOUND21.WAV", "start": 4802888, "end": 4811986}, {"filename": "/SOUND/SOUND22.WAV", "start": 4811986, "end": 4819265}, {"filename": "/SOUND/SOUND24.WAV", "start": 4819265, "end": 4831275}, {"filename": "/SOUND/SOUND25.WAV", "start": 4831275, "end": 4856883}, {"filename": "/SOUND/SOUND26.WAV", "start": 4856883, "end": 4864093}, {"filename": "/SOUND/SOUND27.WAV", "start": 4864093, "end": 4884239}, {"filename": "/SOUND/SOUND28.WAV", "start": 4884239, "end": 4892793}, {"filename": "/SOUND/SOUND29.WAV", "start": 4892793, "end": 4903061}, {"filename": "/SOUND/SOUND3.WAV", "start": 4903061, "end": 4925823}, {"filename": "/SOUND/SOUND30.WAV", "start": 4925823, "end": 4948297}, {"filename": "/SOUND/SOUND34.WAV", "start": 4948297, "end": 4949721}, {"filename": "/SOUND/SOUND35.WAV", "start": 4949721, "end": 4969123}, {"filename": "/SOUND/SOUND36.WAV", "start": 4969123, "end": 5002874}, {"filename": "/SOUND/SOUND38.WAV", "start": 5002874, "end": 5015802}, {"filename": "/SOUND/SOUND39.WAV", "start": 5015802, "end": 5043987}, {"filename": "/SOUND/SOUND4.WAV", "start": 5043987, "end": 5060517}, {"filename": "/SOUND/SOUND42.WAV", "start": 5060517, "end": 5089657}, {"filename": "/SOUND/SOUND43.WAV", "start": 5089657, "end": 5112357}, {"filename": "/SOUND/SOUND45.WAV", "start": 5112357, "end": 5122031}, {"filename": "/SOUND/SOUND49.WAV", "start": 5122031, "end": 5123811}, {"filename": "/SOUND/SOUND49D.WAV", "start": 5123811, "end": 5127044}, {"filename": "/SOUND/SOUND5.WAV", "start": 5127044, "end": 5130128}, {"filename": "/SOUND/SOUND50.WAV", "start": 5130128, "end": 5142106}, {"filename": "/SOUND/SOUND52.WAV", "start": 5142106, "end": 5152772}, {"filename": "/SOUND/SOUND54.WAV", "start": 5152772, "end": 5170926}, {"filename": "/SOUND/SOUND55.WAV", "start": 5170926, "end": 5192719}, {"filename": "/SOUND/SOUND57.WAV", "start": 5192719, "end": 5223124}, {"filename": "/SOUND/SOUND58.WAV", "start": 5223124, "end": 5226532}, {"filename": "/SOUND/SOUND7.WAV", "start": 5226532, "end": 5252878}, {"filename": "/SOUND/SOUND8.WAV", "start": 5252878, "end": 5254883}, {"filename": "/SOUND/SOUND9.WAV", "start": 5254883, "end": 5274885}, {"filename": "/SOUND/TABA1.MID", "start": 5274885, "end": 5287208}, {"filename": "/SOUND/TABA2.MID", "start": 5287208, "end": 5303231}, {"filename": "/SOUND/TABA3.MID", "start": 5303231, "end": 5319254}, {"filename": "/WAVEMIX.DLL", "start": 5319254, "end": 5345366}], "remote_package_size": 5345366});

  })();
