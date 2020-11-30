var gulp = require('gulp');
var rename = require("gulp-rename");
var fs = require('fs');
var es = require('event-stream');
var del = require('del');
var Q = require('q');
var util = require('gulp-template-util');
var less = require('less');
var Storage = require('@google-cloud/storage');
var gcs = new Storage({ projectId: "tutor-204108" })

function uploadGCS(bucketName) {
    return es.map(function(file, cb) {
        fs.stat(file.path, function(err, stats) {
            if (stats.isFile()) {
                gcs.bucket(bucketName)
                    .upload(file.path, {
                        destination: `/event/109win30days/${file.relative}`,
                        public: true,
                        metadata: {
                            cacheControl: 'public, max-age=10800'
                          }
                    })
                    .catch(err => {
                        console.error('ERROR:', err);
                    });
            }

            cb(null, file)
        })
    });
}

function buildStyle() {
    return es.map(function(file, cb) {
        less.render(
            file.contents.toString(), {
                paths: [],
                filename: file.path,
                compress: false
            },
            function(error, result) {
                if (error != null) {
                    console.log(error);
                    throw error;
                }
                file.contents = new Buffer(result.css);
                cb(null, file);
            }
        );
    });
}

function styleTask(dest) {
    return function() {
        return gulp.src('src/less/**/*.less')
            .pipe(buildStyle())
            .pipe(rename({extname: '.css'}))
            .pipe(gulp.dest(dest));
    };
}

function copyStaticTask(dest) {
    return function() {
        return gulp.src(['src/**/*.html', 'src/img/**', 'src/js/**', 'src/mp3/**'], {base: "src"})
            .pipe(gulp.dest(dest));
    };
}

function cleanTask() {
    return del([
        'src/css'
    ]);
}

gulp.task('clean', cleanTask);
gulp.task('style', styleTask('src/css'));
gulp.task('build', ['style']);
gulp.task('watch', function() {
    gulp.watch('src/less/**/*.less', ['style']);
});

gulp.task('package', function() {
    var deferred = Q.defer();
    Q.fcall(function() {
        return util.logPromise(cleanTask)
    }).then(function() {
        return Q.all([
            util.logStream(copyStaticTask('dist')),
            util.logStream(styleTask('dist/css'))
        ])
    });

    return deferred.promise;
});

gulp.task("uploadGCSTest", function() {
    return gulp.src(["dist/**/*"], {base: "dist"})
            .pipe(uploadGCS("tutor-events-test"));
});

gulp.task("uploadGCSProd", function() {
    return gulp.src(["dist/**/*"], {base: "dist"})
            .pipe(uploadGCS("tutor-events"));
});

