"use strict";

(function(){
    angular.module('FileUploader').directive('fileModel', fileModel);
    angular.module('FileUploader').directive('uploader', uploader);

    function uploader() {
        var directive = {
            restrict: 'AE',
            transclude: true,
            scope: {
                fileType: '@',
                fileSize: '@',
                uploadButton: '@',
                ngModel: '=',
                uploadUrl : '@',
            },
            template: '<input type="file" class="btn btn-primary" file-type="upload.fileType" file-size="upload.fileSize" file-model="upload.filesModel" multiple/><button ng-click="upload.uploadFile()" ng-if="upload.uploadButton" class="btn btn-primary">Yükle</button>',
            controller: UploaderController,
            controllerAs: "upload",
            bindToController: true,
        };

        function UploaderController($scope, $http) {
            var vm = this;
            vm.uploadFile = uploadFile;
            vm.ngModel = [];

            function uploadFile() {
                var file = vm.filesModel;
                fileUpload(file);
            }

            function fileUpload(file) {
                var fd = new FormData();

                for (var i = 0; i < file.length; i++) {
                    fd.append('file', file[i]);
                }

                $http.post(vm.uploadUrl, fd, {
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined
                    }
                }).success(function(data) {
                    vm.ngModel = data.returnObject.files;
                }).error(function(e) {});
            }
        }

        return directive;
    }

    function fileModel($parse, NotificationService) {
        var directive = {
            restrict: 'A',
            require: ['^uploader'],
            transclude: true,
            link: link
        }

        function link(scope, element, attrs, ctrl) {
            var parentcontroller = ctrl[0];
            var type = element.parent().attr("file-type");
            var size = element.parent().attr("file-size");
            var isbuttonshow = element.parent().attr("upload-button");
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            window.URL = window.URL || window.webkitURL;


            if (typeof type == undefined) {
                type = "jpg,png,jpeg,gif,doc,docx,xls,xlsx,pdf";
            }

            if (typeof size == undefined) {
                size = 5000;
            }
            size = size * 1000;

            if (typeof isbuttonshow == undefined) {
                isbuttonshow = false;
            }

            element.bind('change', function() {
                scope.$apply(function() {
                    var successfiles = [];
                    var unsuccessfiles = [];
                    for (var key in element[0].files) {
                        var item = element[0].files[key];
                        if (item.size <= size) {
                            item.status = 'active';
                            successfiles.push(item);
                        } else {
                            unsuccessfiles.push(item);
                        }
                    }
                    modelSetter(scope, successfiles);
                    !isbuttonshow ? parentcontroller.uploadFile() : isbuttonshow;
                });
            });

            function fileTypeControl(file) {
                var typearr = type.split(',');
                var filetype = file.split('.');
                filetype = filetype[filetype.length - 1];
                for (var key in typearr) {
                    var item = typearr[key];
                    if (item == filetype) return true;
                }

                return false;
            }
        }

        return directive;
    }
})(angular);