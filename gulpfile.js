var gulp         = require('gulp'),
  autoprefixer   = require('gulp-autoprefixer'),
  del            = require('del'),
  browserSync    = require('browser-sync').create(),
  pug            = require('gulp-pug'),
  less           = require('gulp-less'),
  sourcemaps     = require('gulp-sourcemaps'),
  cleanCSS     = require('gulp-clean-css'),
  gcmq           = require('gulp-group-css-media-queries');

var patch = {
  
  styles: {
   dev:'./dev/less/*.*',
   watch: './dev/less/**/*.*'
  },

	jsFiles: [
    './dev/js/*.js'
    ],

	htmlFiles: {
    dev:'./dev/pug/*.pug',
    watch:'./dev/pug/**/*.pug'
  },

  imgFiles: [
  	'./dev/img/**/*.*'
  ],

  fontsFiles: [
    './dev/fonts/**/*.*'
  ],

  libsFiles: [
    './dev/libs/**/*.*',
    './node_modules/jquery/dist/jquery.min.js'
  ],

  out: [
    './'
  ]
  
};


function styles() {
  return gulp.src(patch.styles.dev)
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(less())
  .pipe(sourcemaps.write())
  .pipe(gulp.dest(patch.out + 'css'))
  .pipe(browserSync.stream());
}

function buildStyles() {
  return gulp.src(patch.styles.dev)
  .pipe(less())
  .pipe(autoprefixer({
      browsers: ['>0.1%'],
      cascade: false
    }))
  // .pipe(gcmq())
  .pipe(cleanCSS({
     level: 2
    }))
  .pipe(gulp.dest(patch.out + 'css'));
}

function scripts() {
  return gulp.src(patch.jsFiles)
    .pipe(gulp.dest(patch.out + 'js'))
    .pipe(browserSync.stream());
}

function html() {
  return gulp.src(patch.htmlFiles.dev)
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest(patch.out))
    .pipe(browserSync.stream());
}

function img() {
  return gulp.src(patch.imgFiles)
    .pipe(gulp.dest(patch.out + 'img'))
    .pipe(browserSync.stream());
}

function fonts() {
  return gulp.src(patch.fontsFiles)
    .pipe(gulp.dest(patch.out + 'fonts'));
}

function libs() {
  return gulp.src(patch.libsFiles)
    .pipe(gulp.dest(patch.out + 'libs'));
}

function watch() {
  browserSync.init({
          server: {
              baseDir: patch.out
          }
      });

  gulp.watch(patch.styles.watch, styles);
  gulp.watch(patch.jsFiles, scripts);
  gulp.watch(patch.imgFiles, img);
  gulp.watch(patch.htmlFiles.watch, html).on('change', browserSync.reload);
}

function clear() {
  return del([patch.out + 'css/*', patch.out + 'fonts/*', patch.out + 'img/*', patch.out + 'js/*', patch.out + '*.html']);
}


gulp.task('styles', styles);
gulp.task('img', img);
gulp.task('scripts', scripts);
gulp.task('watch', watch);
gulp.task('build-html', html);

gulp.task('build', gulp.series(clear, libs, fonts, gulp.parallel(buildStyles, scripts, img, html)));
gulp.task('dev', gulp.series(clear, libs, fonts, gulp.parallel(styles, scripts, img, html)));

gulp.task('default', gulp.series('dev', watch));
