var gulp = require('gulp');

var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var nodemon = require('gulp-nodemon');

//Lints our JS files in our server folder for errors

gulp.task('lint', function(){
  return gulp.src('server/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

//Concatenates and Minifies our JS files
//concates all js files in our server folder, renames it then saves it in the dist folder
gulp.task('scripts', function(){
  return gulp.src('server/*.js')
        .pipe(concat('all.js'))
        .pipe(gulp.dest('dist'))
        .pipe(rename('all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'))
})

//Watches for any changes in our JS files in our server folder

gulp.task('watch', function(){
  gulp.watch('server/*.js', ['lint', 'scripts']);
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

//Default Gulp tasks
gulp.task('default', ['lint', 'scripts', 'watch'])