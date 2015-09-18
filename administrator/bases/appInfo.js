/*Copyright (C) 2015  Sao Tien Phong (http://saotienphong.com.vn)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
var appInfoService = angular.module('appInfoService',[]);
appInfoService.factory('appInfo',['$http','$localStorage','user','$rootScope','$location','app',function($http,$localStorage,user,$rootScope,$location,app){
	var info;
	return {
		commands:function(id_app,callback){
			$http.get(server_url + "/api/" + id_app + "/menu").success(function(commands){
				//crm visible
				commands.crm.input.forEach(function(cmd){
					if(cmd.visible) $rootScope.crm_input_visible  = true;
				})
				//crm visible
				commands.sale.input.forEach(function(cmd){
					if(cmd.visible) $rootScope.sale_input_visible  = true;
				})
				
				//acc visible
				commands.acc.forEach(function(module){
					if(module.visible) $rootScope.acc_visible=true;
				})
				//report visible
				commands.report.forEach(function(module){
					if(module.visible) $rootScope.report_visible=true;
				})
				$rootScope.commands = commands;
				$localStorage.setObject(id_app + "_menu_" + $rootScope.user.email,commands)
				if(callback){
					callback(null,commands)
				}
			 }).error(function(e){
				 console.error("Can't get menu of user",e)
				 $rootScope.commands = $localStorage.getObject(id_app + "_menu_" + $rootScope.user.email);
				 if(callback){
					callback(e)
				}
			 })
		},
		get:function(id_app,fn){
			if(!info){
				var url = server_url + "/api/apps/" + id_app;
				$http.get(url).success(function(data){
					info = data;
					fn(null,info);
				}).error(function(error){
					fn(error);
				});
			}else{
				fn(null,info);
			}
		},
		info:function(code,callback){
			if(!id_app){
				id_app = $localStorage.get('id_app');
				if(id_app){
					$rootScope.id_app = id_app;
				}
			}
			if(!id_app && !_.contains(paths_not_require_id_app,code)){
				if(callback){
					callback("Lỗi: bạn phải chọn một công ty");
				}
				$location.url("/app");
				return false;	
				
			}
			//get user info
			if(!$rootScope.user){
				user.getInfo(function(e,u){
					if(e){
						if(callback){
							callback(e);
						}
						return;
					}
					//get app info
					if(!$rootScope.app_info && id_app){
						app.get(id_app,id_app).success(function(dt){
							$rootScope.app_info = dt;
							if(callback){
								callback(null,u,dt)
							}
						}).error(function(e){
							if(callback){
								callback(e);
							}
						});
					}else{
						if(callback){
							callback(null,u,$rootScope.app_info)
						}
						
					}
				});
			}else{
				//get app info
				if(!$rootScope.app_info && id_app && !_.contains(paths_not_require_id_app,code)){
					app.get(id_app,id_app).success(function(dt){
						$rootScope.app_info = dt;
						//callback
						if(callback){
							callback(null,$rootScope.user,dt)
						}
					}).error(function(e){
						if(callback){
							callback(e);
						}
					});
				}else{
					if(callback){
						callback(null,$rootScope.user,$rootScope.app_info)
					}
					
				}
			}
			return true
		}
		
	}
}]);
appInfoService.factory('$localStorage', function ($window,$cookies,$rootScope) {
	return {
		remove:function(key){
			if($window.localStorage){
				$window.localStorage[key] = "";
			}else{
				$cookies[key] ="";
			}
			
		},
		set:function(key,value){
			if($window.localStorage){
				$window.localStorage[key] = value;
			}else{
				$cookies[key]=value;
			}
			
		},
		get:function(key){
			if($window.localStorage){
				return $window.localStorage[key];
			}else{
				return $cookies[key];
			}
			
		},
		setObject:function(key,obj){
			if($window.localStorage){
				$window.localStorage[key] = JSON.stringify(obj);
			}
		},
		getObject:function(key){
			if($window.localStorage){
				var obj = $window.localStorage[key] || '[]';
				return JSON.parse(obj);
			}else{
				return []
			}
			
		}
	}
})
appInfoService.factory('socket', function ($rootScope) {
  var server = server_url;
  if(server && server.split(":").length<3){
	  server = server + ":80"
  }
  var socket = io.connect(server);
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
	once: function (eventName, callback) {
      socket.once(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});

appInfoService.factory('Base64', function() {
    var keyStr = 'ABCDEFGHIJKLMNOP' +
            'QRSTUVWXYZabcdef' +
            'ghijklmnopqrstuv' +
            'wxyz0123456789+/' +
            '=';
    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                        keyStr.charAt(enc1) +
                        keyStr.charAt(enc2) +
                        keyStr.charAt(enc3) +
                        keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);

            return output;
        },

        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                alert("There were invalid base64 characters in the input text.\n" +
                        "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                        "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";

            } while (i < input.length);

            return output;
        }
    };
});
