const fs = require("fs");
const gulp = require('gulp');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const handlebars = require('gulp-compile-handlebars');
const del = require('del');
const replace = require('gulp-replace');
const browserSync = require('browser-sync').create();
const babel = require('gulp-babel');
const headerComment = require('gulp-header-comment');
const deletefile = require('gulp-delete-file');
const zip = require('gulp-zip');


const index = require('gulp-index');

const buildDir = "./dist";
const cssProdDir = "../ui.apps/src/main/content/jcr_root/etc/designs/corporatesite/amplifon-emea/clientlib-amplifon-emea/css";
const cssVendorProdDir = "../ui.apps/src/main/content/jcr_root/etc/designs/corporatesite/amplifon-emea/clientlib-amplifon-emea-vendor/css";
const jsProdDir = "../ui.apps/src/main/content/jcr_root/etc/designs/corporatesite/amplifon-emea/clientlib-amplifon-emea/js";
const jsVendorProdDir = "../ui.apps/src/main/content/jcr_root/etc/designs/corporatesite/amplifon-emea/clientlib-amplifon-emea-vendor/js";
const fontProdDir = "../ui.apps/src/main/content/jcr_root/etc/designs/corporatesite/amplifon-emea/clientlib-amplifon-emea/fonts";
const scriptSrc = ['src/js/*.js','src/components/**/*.js'];
const handlerbarsHelpers =  require('./src/helpers/helper.js').helper();
const reload  = browserSync.reload;

const usePolling = process.platform === "win32" || process.platform === "linux" ;

const npm_assets = { 
  js:[
    'node_modules/gsap/src/minified/TimelineMax.min.js',
    'node_modules/gsap/src/minified/TweenMax.min.js',
    'src/js/amcharts4js/core.js',
    'src/js/amcharts4js/charts.js',
    'src/js/amcharts4js/maps.js',
    'src/js/amcharts4js/themes/material.js',
    'src/js/amcharts4js/themes/animated.js',
    'src/js/ResizeSensor.js',
    // 'src/js/select2.js',
    'node_modules/handlebars/dist/handlebars.min.js',
    'node_modules/picturefill/dist/picturefill.js',
    'node_modules/moment/min/moment-with-locales.min.js',
    // 'node_modules/select2/dist/js/select2.full.min.js',
    'node_modules/jssocials/dist/jssocials.min.js',
    'node_modules/slick-carousel-no-fonts/slick/slick.min.js',
    'node_modules/iframe-resizer/js/iframeResizer.min.js',
    'node_modules/parsleyjs/dist/parsley.js',
    'node_modules/js-cookie/src/js.cookie.js',
    'node_modules/image-focus/dist/image-focus.umd.js',
    'node_modules/bootstrap/js/dist/util.js',
    'node_modules/bootstrap/js/dist/modal.js',
    'node_modules/bootstrap/js/dist/tab.js',
    'node_modules/bootstrap/js/dist/collapse.js',
    'node_modules/jquery-focuspoint/js/jquery.focuspoint.min.js',
    'node_modules/bodymovin/build/player/bodymovin.min.js',
    'node_modules/jquery-circle-progress/dist/circle-progress.min.js',
    'node_modules/gsap/src/minified/TweenMax.min.js',
    'node_modules/gsap/src/minified/TimelineMax.min.js',
    'node_modules/scrollmagic/scrollmagic/minified/ScrollMagic.min.js',
    'node_modules/scrollmagic/scrollmagic/minified/plugins/debug.addIndicators.min.js',
    'node_modules/scrollmagic/scrollmagic/minified/plugins/animation.gsap.min.js'
  ],
  css:[
    // 'node_modules/select2/dist/css/select2.min.css',
    'src/js/select2/dist/css/select2.min.css',
    'node_modules/jssocials/dist/jssocials.css',
    'node_modules/jquery-focuspoint/css/focuspoint.css',
    'node_modules/slick-carousel-no-fonts/slick/slick.css'
  ]
};

function clean() {
  return del([ buildDir ], {force: true});
}

function styles() {
  
  return gulp.src(['src/sass/custom.scss'], {sourcemap: true})
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
        browsers: ['> 1%',
        'last 3 versions',
        'ie >= 10'],
        cascade: false,
        grid: true
    }))     
    .pipe(headerComment(`
      Project: <%= pkg.name %>
      Version: <%= pkg.version %>
      Generated on: <%= moment().format('YYYY-MM-DD HH:mm:ss') %>
      
      Author: <%= _.capitalize(pkg.author) %>
      License: <%= pkg.license %>
    `))
    .pipe(sourcemaps.write('.', {
        includeContent: false,
        sourceRoot: '../sass'
    }))
    //.pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest(buildDir+'/css'))
    .pipe(browserSync.stream());//instead of reloading, injecting css
}

function noScriptCss() {
  return gulp.src(['src/sass/x_no_script.scss'], {sourcemap: true})
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
        browsers: ['last 3 versions'],
        cascade: false
    }))
    .pipe(sourcemaps.write('.', {
        includeContent: false,
        sourceRoot: '../sass'
    }))
    .pipe(gulp.dest(buildDir+'/css'))
    .pipe(browserSync.stream());//instead of reloading, injecting css
}

function scripts() {
  return gulp.src(scriptSrc, { sourcemaps: true })
    .pipe(babel({ presets: ['es2015'] }))
    .pipe(replace('$(', 'jQuery('))
    .pipe(replace('$.', 'jQuery.'))
    //.pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(gulp.dest(buildDir+'/js'));
}

function vendorScripts() {
  return gulp.src(npm_assets.js)
    .pipe(uglify())
    .pipe(concat('vendor.min.js'))
    .pipe(gulp.dest(buildDir+'/js'));
}

function vendorStyles() {
  return gulp.src(npm_assets.css)
    .pipe(concat('vendor.css'))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest(buildDir+'/css'));
}

function copyImages() {
  return gulp.src('src/img/**/*')
    .pipe(gulp.dest(buildDir+'/img'));
}

function copyFavicon() {
  return gulp.src('src/favicon.ico')
    .pipe(gulp.dest(buildDir+'/'));
}

function copyFonts() {
  return gulp.src('src/fonts/**/*')
    .pipe(gulp.dest(buildDir+'/fonts'));
}

function createIndex() {
  return gulp.src(buildDir+'/*.html')
    .pipe(index())
    .pipe(gulp.dest(buildDir));
}

function createTeleborsaCss() {
  return gulp.src(['src/sass/style-teleborsa.scss'], {sourcemap: true})
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
        browsers: ['> 1%',
        'last 3 versions',
        'ie >= 10'],
        cascade: false,
        grid: true
    }))       
    .pipe(sourcemaps.write('.', {
        includeContent: false,
        sourceRoot: '../sass'
    }))
    .pipe(headerComment(`
      Project: <%= pkg.name %>
      Version: <%= pkg.version %>
      Generated on: <%= moment().format('YYYY-MM-DD HH:mm:ss') %>
      
      Author: <%= _.capitalize(pkg.author) %>
      License: <%= pkg.license %>
    `))
    .pipe(gulp.dest(buildDir+'/css'))
    .pipe(browserSync.stream());//instead of reloading, injecting css
}

function compileHtml() {
	var tempData = JSON.parse(fs.readFileSync('./src/helpers/template-data.json'));

	var options = {
		batch : ['./src/pages/','./src/components/','./src/templates','./src/pagesCorporate/','./src/templatesCorporate/'],
		helpers : handlerbarsHelpers
	};

	return gulp.src(['src/pages/*.html','src/pagesCorporate/*.html' ])
    .pipe(handlebars(tempData, options))
    .pipe(headerComment(`
      Project: <%= pkg.name %>
      Version: <%= pkg.version %>
      Generated on: <%= moment().format('YYYY-MM-DD HH:mm:ss') %>
      
      Author: <%= _.capitalize(pkg.author) %>
      License: <%= pkg.license %>
    `))
		.pipe(gulp.dest(buildDir));
}

function saveTmpl(){
  return gulp.src('src/templates/*.html')
    .pipe(gulp.dest(buildDir+'/templates'));
}
function saveTmplCorporate(){
  return gulp.src('src/templatesCorporate/*.html')
    .pipe(gulp.dest(buildDir+'/templatesCorporate'));
}
function saveJsonMock(){
  return gulp.src('src/json/*.json')
    .pipe(gulp.dest(buildDir+'/json'));
}

function serve() {
    browserSync.init({
        server: {
            baseDir: "./"+buildDir,
            directory: true
        }
    });

}

function cssToProd() {
  return gulp.src(buildDir + "/css/custom.css")
    .pipe(gulp.dest(cssProdDir))
}
function cssVendorToProd() {
  return gulp.src(buildDir + "/css/vendor.css")
    .pipe(gulp.dest(cssVendorProdDir))
}
function jsToProd() {
  return gulp.src(buildDir + "/js/main.min.js")
    .pipe(gulp.dest(jsProdDir))
}
function jsVendorToProd() {
  return gulp.src(buildDir + "/js/vendor.min.js")
    .pipe(gulp.dest(jsVendorProdDir))
}
function fontToProd() {
  return gulp.src('src/fonts/**/*')
    .pipe(gulp.dest(fontProdDir))
}

var build = gulp.series(clean, styles, noScriptCss, createTeleborsaCss, vendorStyles, scripts, vendorScripts, compileHtml, saveTmpl, saveJsonMock, copyFonts, copyImages, copyFavicon, createIndex);


function watch() {
  gulp.watch(['src/sass/**/*.scss','src/components/**/*.scss','src/components/**/*.scss'], { usePolling: usePolling }, styles, createTeleborsaCss);
  gulp.watch(['src/sass/x_no_script.scss'], { usePolling: usePolling }, noScriptCss);
  gulp.watch(scriptSrc,  { usePolling: usePolling }, scripts).on('change', reload);
  gulp.watch(['src/pages/*.html','./src/components/**/*.html','src/pagesCorporate/*.html'], { usePolling: usePolling },  compileHtml).on('change', reload);
  gulp.watch(['./src/templates/*.html'],saveTmpl).on('change',reload);
  gulp.watch(['./src/templatesCorporate/*.html'],saveTmplCorporate).on('change',reload);
}


gulp.task('sass', styles, noScriptCss, createTeleborsaCss );
gulp.task('scripts', scripts );
gulp.task('compile-html', compileHtml );
gulp.task('watch', gulp.parallel(watch, serve ));
gulp.task('build', build);
gulp.task('copy-font', copyFonts );
gulp.task('serve', serve );
gulp.task('prod', gulp.parallel(cssToProd, jsToProd, cssVendorToProd, jsVendorToProd, fontToProd ));

gulp.task('create:index', createIndex );