const gulp = require('gulp'),
    sass = require('gulp-sass'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    cssnano = require('cssnano'),
    del = require('del'),
    browserSync = require('browser-sync').create(),
    plumber = require('gulp-plumber'),
    pug = require('gulp-pug'),
    newer = require('gulp-newer'),
    imagemin = require('gulp-imagemin'),
    notify = require('gulp-notify');


let paths = {
  styles: {
    src: './assets/scss/layout.scss',
    dest: './_dist/assets/css/'
  },
  html: {
    src: './layout/*.pug',
    dest: './_dist/'
  },
  scripts: {
    src: './assets/js/*.js',
    dest: './_dist/assets/js/'
  },
  image: {
    src: './assets/img/**/*',
    dest: './_dist/assets/img/'
  },
  fonts: {
    src: './assets/fonts/*',
    dest: './_dist/assets/fonts/'
  },
  css: {
    src: './assets/css/*',
    dest: './_dist/assets/css/'
  }
};
function browser(done) {
  browserSync.init({
    server: {
      baseDir: './_dist/'
    },
    port: 3000
  });
  done();
}
function reload(done) {
  browserSync.reload();
  done();
}
function cleanup() {
  return del('./_dist/');
}
function scss() {
  return (
    gulp
      .src(paths.styles.src)
      .pipe(plumber())
      .pipe(sass({outputStyle: 'expanded'}))
      .on('error', sass.logError)
      .pipe(postcss([autoprefixer(), cssnano()]))
      .pipe(gulp.dest(paths.styles.dest))
      .pipe(browserSync.stream())
  );
}
function scripts() {
  return (
    gulp
      .src(paths.scripts.src)
      .pipe(plumber())
      .pipe(gulp.dest(paths.scripts.dest))
      .pipe(browserSync.stream())
  );
}
function css() {
  return (
    gulp
      .src(paths.css.src)
      .pipe(plumber())
      .pipe(gulp.dest(paths.css.dest))
      .pipe(browserSync.stream())
  );
}
function fonts() {
  return (
    gulp
      .src(paths.fonts.src)
      .pipe(plumber())
      .pipe(gulp.dest(paths.fonts.dest))
      .pipe(browserSync.stream())
  );
}
function images() {
  return gulp
    .src(paths.image.src)
    .pipe(newer(paths.image.dest))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
              collapseGroups: true
            }
          ]
        })
      ])
    )
  .pipe(gulp.dest(paths.image.dest));
}
function pug_src() {
  return gulp
  .src(paths.html.src)
  .pipe(plumber({errorHandler: notify.onError("PUG Error: <%= error.message %>"),}))
  .pipe(pug({
    pretty: true,
  }))
  .pipe(gulp.dest(paths.html.dest));
}

function watchFiles() {
  gulp.watch(paths.styles.src, gulp.series(scss, reload));
  gulp.watch(paths.fonts.src, gulp.series(fonts, reload));
  gulp.watch(paths.css.src, gulp.series(css, reload));
  gulp.watch(paths.scripts.src, gulp.series(scripts, reload));
  gulp.watch(paths.html.src, gulp.series(pug_src, reload));
  gulp.watch(paths.image.src, gulp.series(images, reload));
}
const build = gulp.series(cleanup, gulp.parallel(scripts, fonts, css, scss, images, pug_src));
const watch = gulp.series(build, gulp.parallel(watchFiles, browser));

exports.cleanup = cleanup;
exports.watch = watch;
exports.build = build;
exports.default = build;