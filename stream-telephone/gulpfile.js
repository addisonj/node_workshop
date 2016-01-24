var gulp = require('gulp')
var sourcemaps = require('gulp-sourcemaps')
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var browserify = require('browserify')
var watchify = require('watchify')
var babel = require('babelify')
var nodemon = require('gulp-nodemon')

function compile(watch) {
  var bundler = watchify(browserify('./app/index.js', { debug: true }).transform(babel.configure({
      // Use all of the ES2015 spec
      presets: ["es2015", "react"]
  })))

  function rebundle() {
    const task = bundler.bundle()
      .on('error', function(err) {
        console.error(err)
        this.emit('end')
      })
      .pipe(source('build.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./build'))

    task.on('end', function() {
      console.log('-> finished bundling')
    })
  }

  if (watch) {
    bundler.on('update', function() {
      console.log('-> bundling...')
      rebundle()
    })
  }

  rebundle()
}

function watch() {
  return compile(true)
}

gulp.task('build', function() { return compile() })
gulp.task('watch', function() { return watch() })

gulp.task('server', ['build'], function() {
  var nodemonOpts = {
    script: 'server/index.js',
    ext: 'js json jsx',
    ignore: ['app/**', 'build/**', 'gulpfile.js', 'node_modules/**', 'client.js'],
    execMap: {
     js: 'babel-node'
    }
  }
  return nodemon(nodemonOpts)
    .on('restart', function() {
      console.log('Restarted Server')
    })
})

gulp.task('default', ['watch', 'server'])
