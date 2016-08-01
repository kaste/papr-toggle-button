/* globals require */
const gulp = require('gulp')
const plumber = require('gulp-plumber')
// const cache = require('gulp-cached')
const rollup = require('gulp-rollup-file')
const processInline = require('gulp-process-inline')
const babel = require('rollup-plugin-babel')
const del = require('del')
const browserSync = require('browser-sync').create()
const bowerConfig = require('./bower.json')


const SRC_ELEMENTS = 'src/*.html'
const DEST = 'build'
const COMPONENT_NAME = bowerConfig.name
const COMPONENT_DIR = `/bower_components/${COMPONENT_NAME}`


gulp.task('rollup-elements', ['clean'], function() {
  return gulp.src(SRC_ELEMENTS)
    .pipe(plumber())
    // .pipe(cache('all_elements'))
    .pipe(processInline().extract('script:not([src])'))
    .pipe(rollup({
      format: 'iife',
      plugins: [ babel() ],
      external: [
        'Pony.decorators'
      ],
      globals: {
        'Pony.decorators': 'Pony.decorators'
      }
    }))
    .pipe(processInline().restore())
    .pipe(gulp.dest(DEST))
})

gulp.task('watch-elements', ['rollup-elements'], function(){
  gulp.watch('src/**/*', ['rollup-elements'])
})

gulp.task('serve', function() {
  browserSync.init({
    server: {
      baseDir: './',
      routes: {
        [COMPONENT_DIR]: '.'
      }
    },

    startPath: COMPONENT_DIR
  })

  gulp.watch(`${DEST}/*.*`).on('change', browserSync.reload)
  gulp.watch('test/*.*').on('change', browserSync.reload)
})

let _once = false
gulp.task('clean', function() {
  if (!_once) {
    return del([
      'build'
    ]).then( () => _once = true )
  }
})

gulp.task('work', ['watch-elements', 'serve'])
gulp.task('build', ['rollup-elements'])
gulp.task('default', ['work'])
