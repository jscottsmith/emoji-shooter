var gulp = require('gulp');
var connect = require('gulp-connect');
var browserify = require('browserify');
var babelify = require('babelify');
var autoprefixer = require('gulp-autoprefixer');
var audiosprite = require('gulp-audiosprite');
var sass = require('gulp-sass');
var sassGlob = require('gulp-sass-glob');
var source = require('vinyl-source-stream');
var watch = require('gulp-watch');

// Paths
// -------------------------
var paths = {
    build: 'build',
    buildJs:'build/js',
    buildCss: 'build/css',
    buildImages: 'build/images',
    buildSounds: 'build/sounds',
    html: 'src/index.html',
    js: 'src/js/**/*',
    sass: 'src/sass/*',
    entry: 'src/js/client.js',
    images: 'src/images/**/*',
    sounds: 'src/sounds/**/*',
};

// Watch
// -------------------------
gulp.task('watch', function(){
    gulp.watch(paths.js, ['build-js']);
    gulp.watch(paths.html, ['copy-html']);
    gulp.watch(paths.images, ['copy-images']);
    gulp.watch(paths.images, ['sound-spite']);
    gulp.watch(paths.sass, ['compile-scss']);
});

// Build
// -------------------------

gulp.task('build-js', function () {
    browserify({
        entries: paths.entry,
        extensions: ['.jsx', '.js'],
        debug: true
    })
    .transform(babelify, {presets: ['react', 'es2015', 'stage-0', 'stage-1']})
    .bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest(paths.buildJs))
    .pipe(connect.reload());
});

// Html
// -------------------------
gulp.task('copy-html', function () {
    return gulp
        .src(paths.html)
        .pipe(gulp.dest(paths.build))
        .pipe(connect.reload());
});

// Images
// -------------------------
gulp.task('copy-images', function () {
    return gulp
        .src(paths.images)
        .pipe(gulp.dest(paths.buildImages))
        .pipe(connect.reload());
});

// Sound
// -------------------------
gulp.task('sound-spite', function() {
    return gulp.src(paths.sounds)
        .pipe(audiosprite({
            format: 'howler',
            path: '/sounds',
            log: 'info',
            export: 'mp3, ogg',
            channels: 2,
            bitrate: 128,
            vbr: 5
        }))
        .pipe(gulp.dest(paths.buildSounds));
});
    
// Sass Compile
// And Auto Prefixer
// -------------------------
gulp.task('compile-scss', function () {
    return gulp
        .src(paths.sass)
        .pipe(sassGlob())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer('last 2 versions'))
        .pipe(gulp.dest(paths.buildCss));
});

// Server
// -------------------------
gulp.task('connect', function() {
    connect.server({
        root: paths.build,
        livereload: true
    });
});

// Default Task
// -------------------------
gulp.task('default', ['build-js', 'copy-html', 'copy-images', 'sound-spite', 'compile-scss', 'watch', 'connect']);
