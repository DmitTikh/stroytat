import gulp from 'gulp'; // сам gulp и его команды
import sync from 'browser-sync'; // автоматическое обновление браузера
import image from 'gulp-image'; // минификация изображений
import fileInclude from 'gulp-file-include'; // для объединения html файлов в один html
import {deleteAsync} from 'del'; // для удаления файлов
import sass from 'sass'; // для конвертации sass/scss в css
import gulpSass from 'gulp-sass'; // для конвертации sass/scss в css, используется вместе с sass пакетом
import autoprefixer from 'gulp-autoprefixer'; // автоматическая простановка вендорных префиксов
import group_media from 'gulp-group-css-media-queries'; // группировка и размещение медиазапросов в конце css файла, для оптимизации
import clean_css from 'gulp-clean-css'; // минификация css
import rename from 'gulp-rename'; // для изменения имени файлов
import gulpUglify from 'gulp-uglify-es'; // для минификации js
import concat from 'gulp-concat'; // для объединения js файлов в один

const browsersync = sync.create();
const scss = gulpSass(sass);      
const uglify = gulpUglify.default;      
  
let project_folder = 'dist',
    source_folder = 'src';

let path = {
    build: {
        html: project_folder + '/',
        css: project_folder + '/css/',
        js: project_folder + '/js/',
        img: project_folder + '/img/',
        icons: project_folder + '/icons/',
        fonts: project_folder + '/fonts/'
    },
    src: {
        html: [source_folder + '/html/*.html', '!' + source_folder + '/html/_*.html'], // берем все файлы html за исключением, тех нахвание которых начинается с _
        css: source_folder + '/assets/sass/main.scss',
        js: source_folder + '/js/*.js',
        img: source_folder + '/assets/img/**/*.+(png|jpg|gif|ico|svg|webp)',
        icons: source_folder + '/assets/icons/**/*.+(png|jpg|gif|ico|svg|webp)',
        fonts: source_folder + '/assets/fonts/*.woff'
    },
    watch: {
        html: source_folder + '/html/*.html',
        css: source_folder + '/assets/sass/*.scss',
        js: source_folder + '/js/*.js',
        img: source_folder + '/assets/img/**/*.+(png|jpg|gif|ico|svg|webp)'
    },
    clean: './' + project_folder + '/'
};

export const browserSync = () => {
    browsersync.init({
        server: {
            baseDir: './' + project_folder + '/'
        },
        port: 3000,
        notify: false
    })
};

export const fonts = () => {
    return gulp.src(path.src.fonts)
            .pipe(gulp.dest(path.build.fonts))
            .pipe(gulp.src(path.src.fonts))
            .pipe(gulp.dest(path.build.fonts))
            .pipe(gulp.src(path.src.fonts))
            .pipe(gulp.dest(path.build.fonts))
};

export const html = () => {
    return gulp.src(path.src.html)
           .pipe(fileInclude({
            prefix: '@@',
            basepath: '@file'
          }))
           .pipe(gulp.dest(path.build.html))
           .pipe(browsersync.stream());
};

export const js = () => {
    return gulp.src(path.src.js)
           .pipe(concat('main.js'))
           .pipe(gulp.dest(path.build.js))
           .pipe(uglify())
           .pipe(rename({
               extname: ".min.js"
           }))
           .pipe(gulp.dest(path.build.js))
           .pipe(browsersync.stream());
};

export const watchFiles = () => {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);   
};

export const clean = () => {
    return deleteAsync(path.clean);
};

export const css = () => {
    return gulp.src(path.src.css)
           .pipe(
               scss({
                   outputStyle: 'expanded'
               })
           )
           .pipe(autoprefixer({
               overrideBrowserslist: ['last 5 versions'],
               cascade: true
           }))
           .pipe(group_media())
           .pipe(gulp.dest(path.build.css))
           .pipe(clean_css())
           .pipe(rename({
               extname: ".min.css"
           }))
           .pipe(gulp.dest(path.build.css))
           .pipe(browsersync.stream());
};

export const images = () => {
    return gulp.src(path.src.img)
           .pipe(gulp.dest(path.build.img))
           .pipe(gulp.src(path.src.img))
           .pipe(image())
           .pipe(gulp.dest(path.build.img))
           .pipe(browsersync.stream())
};
export const icons = () => {
    return gulp.src(path.src.icons)
           .pipe(gulp.dest(path.build.icons))
};

export let build = gulp.series(clean, gulp.parallel(html, css, js, images, icons, fonts));
let watches = gulp.parallel(build, watchFiles, browserSync);
export default watches;