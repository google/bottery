'use strict';

module.exports = function(grunt){
  var protocol = grunt.option('https')?'https' : 'http';
  var liveReloadPort = grunt.option('liveReloadPort') || 35730;
  var serverPort = grunt.option('port') || 9000;
  var HOST_IP = 'localhost';
  grunt.initConfig({
    connect: {
      options: {
        port: serverPort,
        hostname: HOST_IP,
        base: './src',
        protocol : protocol
      },
      livereload: {
        options: {
          middleware: function(connect) {
            return [
              require('connect-livereload')({ port: liveReloadPort }),
              require('serve-static')('./')
            ];
          }
        }
      }
    },
    watch: {
      options: {
        livereload: liveReloadPort
      },
      files: [
        '/js/**/*.js',
        '/bots/**/*.js',
        '/css/**/*.css',
        '!/js/vendor/*',
      ]
    },
    open: {
      dev: {
        path: '<%= connect.options.protocol %>://<%= connect.options.hostname %>:<%= connect.options.port %>/'
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-open');
  grunt.registerTask('serve', [
    'connect:livereload',
    'open:dev',
    'watch'
  ]);
}
