module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-git-describe');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-concat-sourcemap');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-forever');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    html2js: {
      /**
       * These are the templates from `src/app`.
       */
      app: {
        options: {
          base: 'src'
        },
        src: ['src/**/*.tpl.html'],
        dest: 'build/templates-app.js'
      }
    },
    less: {
      all: {
        src: 'style.less',
        dest: 'build/style.css',
        options: {
          report: 'gzip'
        }
      }
    },
    watch: {
      options: {
        atBegin: true,
        livereload: true
      },
      templates: {
        files: ['src/**/*.tpl.html'],
        tasks: ['html2js']
      },
      less: {
        files: ['style.less', 'src/**/*.less'],
        tasks: ['less']
      },
      sources: {
        files: ['src/**/*.js', 'src/*.js'],
        tasks: ['concat_sourcemap:app']
      },
      index: {
        files: 'index.html',
        tasks: ['copy:index']
      },
      server: {
        files: 'run.js',
        tasks: ['forever:restart']
      }
    },
    forever: {
      options: {
        index: 'run.js'
      }
    },
    'git-describe': {
      all: {}
    },
    // Useful in future, when i'll need to minify
    // concat: {
    //   buildapp: {
    //     src: ['src/**/*.js', 'src/*.js'],
    //     dest: 'build/app.js',
    //     options: {
    //       banner: '/*! <%=pkg.name %> v<%=grunt.option("gitRevision") %> | date: <%=grunt.template.today("dd-mm-yyyy") %> */\n'
    //     }
    //   },
    //   buildlibs: {
    //     src: [
    //       'libs/angular/angular.js',
    //       'libs/angular-animate/angular-animate.js',
    //       'libs/angular-mocks/angular-mocks.js',
    //       'libs/angular-ui-router/release/angular-ui-router.js'
    //     ],
    //     dest: 'build/libs.js'
    //   },
    //   together: {
    //     src: ['build/*.js'],
    //     dest: 'build/all.js'
    //   }
    // },
    concat_sourcemap: {
      options: {
        sourcesContent: true
      },
      app: {
        src: ['src/**/*.js', 'src/*.js'],
        dest: 'build/app.js'
      },
      libs: {
        src: [
          'libs/angular/angular.js',
          'libs/angular-bootstrap/ui-bootstrap-tpls.min.js',
          'libs/angular-animate/angular-animate.js',
          'libs/jquery/jquery.min.js',
          'libs/jquery.cookie/jquery.cookie.js',
          'libs/angular-ui-router/release/angular-ui-router.js',
          'libs/ng-grid-bower/ng-grid.min.js',
          'libs/angular-confirm-click/dist/confirmClick.js'
        ],
        dest: 'build/libs.js'
      }
    },
    copy: {
      index: {
        src: 'index.html',
        dest: 'build/',
        options: {
          processContent: function (content, srcpath) {
            // Compiling index.html file!
            return grunt.template.process(content, {
              gitRevision: grunt.option('gitRevision')
            });
          }
        }
      }
    },
    clean: {
      all: {
        src: ['build/']
      }
    }
  });

  grunt.registerTask('saveRevision', function () {
    grunt.event.once('git-describe', function (rev) {
      grunt.option('gitRevision', rev);
    });
    grunt.task.run('git-describe');
  });

  // Build process:
  // - clean build/
  // - creates build/templates-app.js from *.tpl.html files
  // - creates build/style.css from all the .less files
  // - get git revision in local grunt memory
  // - concatenates all the source files in build/app.js - banner with git revision
  // - concatenates all the libraries in build/libs.js
  // - copies index.html over build/
  grunt.registerTask('build', ['clean', 'html2js', 'less', 'saveRevision', 'concat_sourcemap:app', 'concat_sourcemap:libs', 'copy']);
  grunt.registerTask('default', ['clean', 'concat_sourcemap:libs', 'watch', 'forever']);
};
