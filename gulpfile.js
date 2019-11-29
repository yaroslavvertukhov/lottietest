const gulp = require('gulp'); // модуль gulp
const rename = require("gulp-rename"); // rename файлов
const browserSync = require("browser-sync") // перезагрузка браузера
const sourcemaps = require('gulp-sourcemaps'); // карта исходных файлов
const replace = require('gulp-replace'); // замена строки в файлах

//css
const concatCss = require('gulp-concat-css'); // модуль соединения файлов CSS
const autoprefixer = require('gulp-autoprefixer'); // автопрефиксер для CSS
const csso = require('gulp-csso'); // сжатие CSS
const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob'); //импорт глубокой вложенности

sass.compiler = require('node-sass');

//js
const webpack = require('webpack'); // webpack
const webpackConfig = require('./src/jsModules/webpack.config.js'); // webpack конфиг с путями для js

//imag
const gulpImagemin = require('gulp-imagemin'); // сжатие изображений
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const pngquant = require('imagemin-pngquant');

function browserSyncInit(cb) {
    browserSync.init({
        server: {
            baseDir: "./",
            // часть для работы с ajax на http://localhost
            routes: {},
            middleware: function (req, res, next) {
                if (/\.json|\.txt|\.html/.test(req.url) && req.method.toUpperCase() == 'POST') {
                    console.log('[POST => GET] : ' + req.url);
                    req.method = 'GET';
                }
                next();
            }
            // часть для работы с ajax на http://localhost
        }
    });
    cb();
}

function browserSyncReload(cb) {
    browserSync.reload();
    cb();
}

function watchFiles() {
    gulp.watch("./src/sass/**/*.*", cssBuild);
    gulp.watch("./**/*.html", browserSyncReload);
}

function cssBuild() {
    return gulp.src('./src/sass/index.sass')
        .pipe(sourcemaps.init())
        .pipe(sassGlob())
        .pipe(sass().on('error', sass.logError))
        .pipe(rename('style.min.css'))
        .pipe(autoprefixer())
        .pipe(csso())
        .pipe(sourcemaps.write('../maps'))
        .pipe(gulp.dest('./dist/css/'))
        .pipe(browserSync.stream());
}

function jsBuild(cb) {
        if (isProductionBuild()) {
            webpackConfig.mode = "production";
        }

        let compiler = webpack(webpackConfig);

        compiler.run(function(err, stats) {
            console.log(stats.toString({
                colors: true
            }));

            if (!err || !stats.hasErrors()) {
                browserSync.reload();
                cb();
            }
        });
}

function jsWatch(cb) {
    let compiler = webpack(webpackConfig),
        watchOptions = {
            aggregateTimeout: 300,
            poll: undefined
        };

        compiler.watch(watchOptions, function(err, stats) {
            console.log(stats.toString({
                colors: true
            }));

            if (!err || !stats.hasErrors()) {
                browserSync.reload();
                cb();
            }
        });

}

function optimizationImages(cb) {
    gulp.src('./src/images/**/*.*')
        .pipe(gulpImagemin([
            gulpImagemin.gifsicle({interlaced: true}),
            gulpImagemin.jpegtran({progressive: true}),
            imageminJpegRecompress({
                loops: 5,
                min: 65,
                max: 70,
                quality:'medium',
                progressive: true
            }),
            gulpImagemin.optipng({optimizationLevel: 3}),
            pngquant({quality: [0.7, 0.8], speed: 5})
        ]))
        .pipe(gulp.dest('./dist/images/'));

    replaceStrFiles("src/", "dist/", "./**/*.html");

    browserSync.stream();

    cb();
}

//функция замены строки в файлах
function replaceStrFiles(oldStr, newStr, path) {
    gulp.src([path])
    .pipe(replace(oldStr, newStr))
    .pipe(gulp.dest('./'));
}

//проверка есть ли в вызове таска флаг --prod
function isProductionBuild() {
    if (process.argv.length >= 4) {
        if (process.argv[process.argv.length - 1] === "--prod") {
            return true;
        }
    }
}


exports.zimg = optimizationImages;
exports.build = gulp.parallel(cssBuild, jsBuild); // gulp build --prod (Сборка с сжатым js)
exports.default = gulp.series(gulp.parallel(cssBuild, jsWatch), browserSyncInit, watchFiles);
