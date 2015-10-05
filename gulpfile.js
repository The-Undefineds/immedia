var gulp = require('gulp');
var uglify = require('gulp-uglify');
var htmlreplace = require('gulp-html-replace');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify');
var streamify = require('gulp-streamify');
var sftp = require('gulp-stfp');

//used for restarting the server upon change in our server file
var nodemon = require('gulp-nodemon');

//used for refreshing the browser upon change in specified files
//as of v0.0.1 this modules has not been used in the gulpfile
var notify = require('gulp-notify');
var livereload = require('gulp-livereload');


//More seemless Gulp Task Management
var path = {
  HTML: './client/index.html',
  MINIFIED_OUT: 'build.min.js',
  OUT: 'build.js',
  DEST: 'dist',
  DEST_BUILD: 'dist/build',
  DEST_SRC: 'dist/src',
  ENTRY_POINT: './client/src/mainview.jsx'
};

gulp.task('copy', function(){
  gulp.src(path.HTML)
    .pipe(gulp.dest(path.DEST));
});

//Watches for any changes in our JSX files to javascript
gulp.task('watch', function(){
  gulp.watch(path.HTML, ['copy'])

  var watcher = watchify(browserify({
    entries: [path.ENTRY_POINT],
    transform: [reactify],
    debug: true,
    cache: {}, packageCache: {}, fullPaths: true
  }));

  return watcher.on('update', function(){
    watcher.bundle()
      .pipe(source(path.MINIFIED_OUT))
      .pipe(gulp.dest(path.DEST_BUILD))
      console.log('Updated Minified Source Build');
  })
    .bundle()
    .pipe(source(path.MINIFIED_OUT))
    .pipe(streamify(uglify(path.MINIFIED_OUT)))
    .pipe(gulp.dest(path.DEST_BUILD))
})

//Concatenates and Minifies our JS files
//concates all JSX files, renames it then saves it in the dist folder

gulp.task('build', function(){
  browserify({
    entries: [path.ENTRY_POINT],
    transform: [reactify]
  })
  .bundle()
  .pipe(source(path.MINIFIED_OUT))
  .pipe(streamify(uglify(path.MINIFIED_OUT)))
  .pipe(gulp.dest(path.DEST_BUILD))
  console.log('One moment creating minified source build');

  browserify({
    entries: [path.ENTRY_POINT],
    transform: [reactify]
  })
  .bundle()
  .pipe(source(path.OUT))
  .pipe(gulp.dest(path.DEST_SRC))
  console.log('One moment creating source build');

});

//restarts the server whenever there is any change on server/server.js
gulp.task('nodemon', function(){
  console.log('in nodemon')
  nodemon({
    script: './server/server.js',
    ext: 'js',
    // tasks: [],
    env: {'NODE_ENV': 'development'}
  })
  .on('start', function(){
    console.log('Server Started!!!');
  })
  .on('restart', function(){
    console.log('Server Restarted!!!');
  })
});

gulp.task('deploy', function(){
  function send(path, remotePath){
    return gulp.src(path)
      .pipe(sftp({
        host: '192.241.209.214',
        user: 'immedia',
        pass: 'workhardplayhard',
        remotePath: remotePath
      }))
      .on('error', function(error){
        console.log(error)
      })
  };
  send(__dirname + 'package.json', '/home/immedia/immedia');
  send(__dirname + '/server', '/home/immedia/immedia/server');
  send(__dirname + '/client', '/home/immedia/immedia/client');
  send(__dirname + '/dist', '/home/immedia/immedia/dist');
})

gulp.task('finished', function(){
  console.log('Your production code was successfully built')
})

//Default Gulp tasks
gulp.task('default', ['copy', 'watch', 'nodemon']);

//Run Production tasks
gulp.task('production', ['copy', 'build', 'finished']);
