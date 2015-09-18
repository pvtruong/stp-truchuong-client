"use strict";
var id_app;
var server_url=""
var access_token;
var paths_not_require_id_app = ['code','app','colleague','notification','message','profile','users','comment','versioninfo','follow','admin'];
var accApp = angular.module("accApp",[//,'ngTouch'
		'ngRoute','ui.bootstrap','ngAnimate','luegg.directives','ngCookies','textAngular','ngTextcomplete','ui.slimscroll'//,"highcharts-ng",'ngToast'
		//system
		,'appInfoService','loginModule','appModule','colleagueModule','notificationModule','messageModule','usersModule','rptModule','parameterModule','commentModule','versioninfoModule'
		,'dashboardModule'
		//crm 
		,'dmkhModule','lienheModule','noteModule','taskModule','groupModule','fileModule','mailaccountModule','mailreceivedModule','mailscheduleModule','mailsentModule','mailtemplateModule','contractModule','warrantyModule'//CRM
		//hrm
		,'dmnvModule'
		//acc
		,'dvcsModule','dmntModule','dmtkModule','dmtcModule','dmvatModule','dmdvtModule','dmvtModule','dmnganhhangModule','dmnvtModule','dmkhoModule','ptthanhtoanModule'
		,'dmcpmhModule','ctcpmhModule','giamtruModule','lichsugiuModule','lichsugiaoModule','khuyenmaiModule'
		,'cdtkModule','cdkhModule','cdvtModule','cddtModule','dmchietkhauModule'
		,'sctdtModule','cdpsdtModule'
		,'bkctModule','searchModule','cdpstkModule','scttkModule','socaitkModule','sochutModule','sctcnkhModule','cdpskhModule','sonkcModule','sonkttModule','sonkctModule','sonkmhModule','sonkbhModule'   
		,'bcdktModule','kbmbcdktModule'
		,'bkvatvaoModule','bkvatraModule'
		,'kbmkqhdkdModule','kqhdkdModule'
		,'kbmlcttttModule','lcttttModule'
		,'kbmlcttgtModule','lcttgtModule'
		,'kbmpttctModule','rptformModule','pttctModule'
		,'thnxtModule','sctvtModule','tinhgiatbModule'
		,'vatvaoModule','vatraModule','kbmtkgtgtModule','tkgtgtModule'
		,'pktModule','dmkcModule','pkcModule'
		,'pn1Module','pn2Module','pn5Module','pn3Module','pn9Module'
		,'hd2Module','hd1Module','hd3Module','pblModule','so1Module'
		,'pnkModule','pxkModule','pxcModule'
		,'tdttcoModule','tdttnoModule'
		,'pc1Module','pt1Module'
		,'dmbpModule','dmdtModule','dmphiModule'
		//assets and tools
		,'dmloaitsModule','dmtanggiamtsModule','dmnguonvonModule','qtsModule','qtsdieuchinhModule'
		,'tinhkhauhaotsModule','hspbtsModule','dckhauhaotsModule','pkhModule'
		,'bangtinhkhauhaoModule','sotaisanModule','chitiettaisanModule'
		//sale
		,'dtbanletheongayModule','dtbanletheothangModule','dtbanletheoquyModule','dtbanletheonamModule','tonghopbanhangModule'
		,'dtbanletheovtModule','dtbanletheokhModule','dtbanletheonvModule','ctbanleModule','hangbanbitralaiModule','cthangbanbitralaiModule','chitietthutientheohoadonModule'
		,'hoadonbanhangtheohanttModule','phanbothutienchohoadonModule'
		//purchase
		,'ctmuahangModule','tonghopmuahangModule','tonghoptralaihangModule','cttralaihangModule','chitietchitientheohoadonModule'
		,'hoadonmuahangtheohanttModule','phanbochitienchohoadonModule'
		
	]);
	
accApp.config(['$provide', function($provide) {
  //config for text editor
  var insertTextAtCursor = function(text) {
		var sel, range;
		if (window.getSelection) {
			sel = window.getSelection();
			if (sel.getRangeAt && sel.rangeCount) {
				range = sel.getRangeAt(0);
				range.deleteContents();
				range.insertNode(document.createTextNode(text));
			}
		} else if (document.selection && document.selection.createRange) {
			document.selection.createRange().text = text;
		}
	}
  $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function(taRegisterTool, taOptions){
		// register the tool with textAngular
		taRegisterTool('insertName', {
			buttontext:'Tên',
			action: function(){
			
                return insertTextAtCursor("{{receiver.name}}");
            
			}
		});
		// register the tool with textAngular
		taRegisterTool('insertAddress', {
			buttontext:'Email',
			action: function(){
			
                return insertTextAtCursor("{{receiver.address}}");
            
			}
		});
		// add the button to the default toolbar definition
		taOptions.toolbar[1].push('insertName');
		taOptions.toolbar[1].push('insertAddress');
		return taOptions;
	}]);
}])

// allow DI for use in controllers, unit tests
accApp.constant('_', window._);
accApp.constant('async', window.async);

//neu ham api nao tra ve loi 401 thi redirect to trang login
function httpInterceptor($q,$injector, $window, $location,$rootScope){
	return {
	  request:function(config){
		  return config;
	  },
	  response:function(response){
		  return response
	  },
	  responseEror:function(response){
		  if (response.status === 401) {
			  $rootScope.isLogined = false;
              $location.url('/login');
          }
		  return $q.reject(response);
	  }
  }
}
accApp.config(['$httpProvider',function($httpProvider){
	$httpProvider.interceptors.push(httpInterceptor);
}]);
//set token to header cho tat ca ca ham api
accApp.factory('api', function ($http, $localStorage,$rootScope) {
  return {
      init: function (token) {
			if(!token){
				token = $localStorage.get('token');
			}
			if(!token){
				$rootScope.isLogined = false;
			}else{
				$rootScope.isLogined = true;
				$rootScope.token = token;
			}
			//console.log(token);
		  access_token = token;
		 
          $http.defaults.headers.common['X-Access-Token'] = token;
      }
  };
});
//khai bao de su dung thu vien async, underscope, init api
accApp.run(function ($rootScope,api,$window,user,app,$location,$http,appInfo,$timeout) {
     //$rootScope.async = window.async;
	 $rootScope.isLogined = false;
	 $rootScope.program_name = "ỨNG DỤNG QUẢN LÝ";
	 $rootScope.program_version = "1.0.0";
	 //$rootScope._ = window._;
	 $rootScope.nextTick = function(callback){
		 $timeout(callback,0)
	 }
	 $rootScope.server_url =server_url
	 //get commands
	 $rootScope.$watch('app_info',function(newValue,oldValue){
		 if(newValue){
			 //get task
			$rootScope.getTask();
			//get menu
			$rootScope.crm_input_visible = false;
			$rootScope.crm_report_visible = false;
			$rootScope.acc_visible = false;
			$rootScope.commands ={}
			appInfo.commands($rootScope.id_app);
			 //members
			 $rootScope.members =[{email:$rootScope.app_info.user_created,name:$rootScope.app_info.user_created.split("@")[0]}];
			$rootScope.app_info.participants.forEach(function(r){
				$rootScope.members.push({email:r.email,name:r.name})
			})
		 }
	 },true)
	 //create menu
	 $rootScope.$watch(function() { 
		  return $location.path(); 
		},
		function(a){
		  a = a.toLowerCase().split("/");
		  if(a.length<=1 || a[1]=="dashboard"|| a[1]==""){
			  $rootScope.menuActive ="DASHBOARD";
		  }else{
			  if($rootScope.commands){
				  var m = _.find($rootScope.commands.modules,function(module){return module.path==a[1]});
				  if(m) $rootScope.menuActive = m.group;
			  }
			  if(a[1]=="login" || a[1] =="logout"){
				$rootScope.messages_count =0;
				$rootScope.notifies_count =0;
				$rootScope.task_count =0;				
			  }
		  }
		  
		});
	$rootScope.$watch('commands',function(newValue){
		if(newValue){
		  var a = $location.path().toLowerCase().split("/");
		  if(a.length<=1){
			  $rootScope.menuActive ="DASHBOARD";
		  }else{
			   var m = _.find($rootScope.commands.modules,function(module){return module.path==a[1]});
			   if(m) $rootScope.menuActive = m.group;
		  }
		}
	},true)
	 $rootScope.openPath = function(path,menu){
		 $rootScope.menuActive = menu;
		 $location.url(path);
	 }
	 //search
	 $rootScope.searchword =""
	 $rootScope.searchAllKeyup = function($event,word){
		 if($event.keyCode===13){
			 if(word){
				$location.url("search/" + word);
			 }
		 }
	 }
	
	 api.init();
	 Metronic.init();
	 Layout.init();
});
