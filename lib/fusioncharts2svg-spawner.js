const path = require('path');
const exec = require('child_process').exec;
const phantomjs = require('phantomjs');
const fs = require('fs');
const phantomBinPath = phantomjs.path;
const maxBuffer = 1024 * 1024 * 100;

function makeTmpDirectory() {
  const tmpPath = path.resolve('./tmp/');
  fs.mkdir(tmpPath, (err) => {
    if (err && err.code != 'EEXIST') {
      throw err;
    }
  });

  return tmpPath;
}

function spawnConverterFromFile(dataSourceFile) {
 const command = `${phantomBinPath} ${path.join(__dirname, '../bin/fusioncharts2svg.js')} ${dataSourceFile}`;

 var promise = new Promise(function (resolve, reject) {
   exec(command, { maxBuffer: maxBuffer },  function (err, stdout, stderr) {
     if (err) reject(err);
     else if(stderr) reject(stderr);
     else resolve(stdout);
   });
 });

 //const deferred = Promise.defer();
 //exec(command, { maxBuffer: maxBuffer }, (err, stdout, stderr) => {
 //  if (err) deferred.reject(err);
 //  else if (stderr) deferred.reject(stderr);
 //
 //  deferred.resolve(stdout);
 //});

 return promise;
}

function spawnConverterFromObject(dataSource) {
  const tmpPath = makeTmpDirectory();
  const tmpFileName = `${tmpPath}/${Date.now()}.json`;
  fs.writeFileSync(tmpFileName, JSON.stringify(dataSource));

  return spawnConverterFromFile(tmpFileName).then((svg) => {
    fs.unlinkSync(tmpFileName);
    return svg;
  });
}

module.exports.fromFile = spawnConverterFromFile;
module.exports.fromObject = spawnConverterFromObject;
