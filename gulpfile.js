var gulp = require('gulp');
var uglify = require('gulp-uglify');
var htmlreplace = require('gulp-html-replace');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify');
var streamify = require('gulp-streamify');

//All given paths for all our files

var path = {
  HTML: 'client/index.html',
  JSX: ['client/*.jsx', 'client/**/*.jsx'],
  JSX_AND_SERVER_JS: ['client/*.jsx', 'client/**/*.jsx','server/server.js'],
  ALL: ['client/*.jsx', 'client/**/*.jsx', 'server/server.js', 'client/index.html'],
  MINIFIED_OUT: 'build.min.js',
  DEST_SRC: 'dist/src',
  DEST_BUILD: 'dist/build',
  DEST: 'dist'
};


//transforms/transpiles our JSX files into JS(javascript)

gulp.task.('transform', function(){
  gulp.src(path.JSX)
    .pipe(react())
    .pipe(gulp.dest(path.DEST_SRC));
});

//allows our transformed JSX files to be referenced by the index.html

gulp.task('copy', function(){
  gulp.src(path.HTML)
    .pipe(gulp.dest(path.DEST));
});

//Lints our JS files in our server folder for errors

gulp.task('lint', function(){
  return gulp.src(path.JSX_AND_SERVER_JS)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

//Concatenates and Minifies our JS files
//concates all js files in our server folder, renames it then saves it in the dist folder
gulp.task('build', function(){
  return gulp.src(path.JSX)
        .pipe(react())
        .pipe(concat(path.MINIFIED_OUT))
        .pipe(uglify(path.MINIFIED_OUT))
        .pipe(gulp.dest(path.DEST_BUILD));
})

//Watches for any changes in our JS files in our server folder

gulp.task('watch', function(){
  gulp.watch(path.JSX_AND_SERVER_JS, ['lint', 'transform', 'build']);
})

//Lints our JS files before running the server in development mode
//It will alert you whenever the server is retarted
gulp.task('develop', function(){
  nodemon({
    scripts: 'server/server.js',
    ext: 'html js',
    tasks: ['lint'],
    env: {'NODE_ENV': 'development'}
  })
  .on('restart', function(){
    console.log('Searver Restarted!')
  })
});


//More Detail Gulp Task Management
var path = {
  HTML: 'client/index.html',
  MINIFIED_OUT: 'build.min.js',
  OUT: 'build.js',
  DEST: 'dist',
  DEST_BUILD: 'dist/build',
  DEST_SRC: 'dist/src',
  ENTRY_POINT: 'yet to be set'
};

gulp.task('copy', function(){
  gulp.src(path.HTML)
    .pipe(gulp.dest(path.DEST));
});

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
    .pipe(gulp.dest(DEST_SRC))
})

//Default Gulp tasks
gulp.task('default', ['watch'])
