const gulp = require('gulp');

const browserify = require('browserify');
const watchify = require('watchify');
const babelify = require('babelify');
const stylify = require('stylify');

const merge = require('utils-merge')
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');

const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');

const gutil = require('gulp-util');
const chalk = require('chalk');

const clientDir  = './client2/';
const libDir     = 'lib/';
const publicDir  = 'public/';
const entryFile  = 'main.jsx';
const bundleFile = 'bundle.js';

const babelOpts = {presets: ['es2015', 'react']};

function bundleJS(bundler) {
  return bundler.bundle()
    .pipe(source(bundleFile))
    .pipe(buffer())
    .pipe(gulp.dest(clientDir + publicDir))
    .pipe(rename(bundleFile))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(clientDir + publicDir))
}

gulp.task('watch', function () {
  var args = merge(watchify.args, {debug: true});
  var bundler = watchify(browserify(clientDir + libDir + entryFile, args)).transform(babelify, babelOpts);
  bundleJS(bundler);

  bundler.on('update', function () {
    var updateStart = Date.now();
    gutil.log('Updating...');
    bundleJS(bundler);
    gutil.log('Updated after', chalk.magenta((Date.now() - updateStart) + ' ms'));
    gutil.beep();
  });
});

gulp.task('build', function () {
  var bundler = browserify(clientDir + libDir + entryFile, {debug: true}).transform(babelify, babelOpts);
  return bundleJS(bundler);
})

gulp.task('build-production', function () {
  process.env.NODE_ENV = 'production';
  var bundler = browserify(clientDir + libDir + entryFile).transform(babelify, babelOpts);
  return bundler.bundle()
    .pipe(source(entryFile))
    .pipe(buffer())
    .pipe(rename(bundleFile))
    .pipe(uglify())
    .pipe(gulp.dest(clientDir + publicDir))
});

gulp.task('default', ['build-production']);
