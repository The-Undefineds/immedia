var gulp = require('gulp');
var uglify = require('gulp-uglify');
var htmlreplace = require('gulp-html-replace');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify');
var streamify = require('gulp-streamify');

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
      .pipe(source(path.OUT))
      .pipe(gulp.dest(path.DEST_SRC))
  })
    .bundle()
    .pipe(source(path.OUT))
    .pipe(gulp.dest(path.DEST_SRC))
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
});

//restarts the server whenever there is any change on server/server.js
gulp.task('nodemon', function(){

  nodemon({
    scripts: './server/server.js',
    ext: 'html js',
    env: {'NODE_ENV': 'development'}
  })
  .on('start', function(){
    console.clear();
    console.log('Server Just Started')
  })
  .on('restart', function(){
    console.clear();
    console.log('Server Restarted!')
  })
});

//Default Gulp tasks
gulp.task('default', ['watch', 'nodemon']);

//Run Production tasks
gulp.task('production', ['build']);
