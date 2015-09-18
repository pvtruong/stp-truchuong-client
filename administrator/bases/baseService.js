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
var baseService = function($http,url_service,fields_find,services){
	var sv =  {
			list:function(id_app,condition,fields,count,page,limit,queryParams,onCondition,filter){
				var url = url_service() + "?t=1" ;
				
				if(count==1){
					url = url + "&count=1";
				}
				if(page){
					url = url + "&page=" + page.toString();
				}
				if(limit){
					url = url + "&limit=" + limit.toString();
				}
				if(angular.isObject(condition)){
					var c ={}
					_.extend(c,condition);
					if(queryParams){
						_.extend(c,queryParams);
					}
					if(filter){
						_.extend(c,filter);
					}
					if(onCondition){
						onCondition(c,condition);
					}
					var q =JSON.stringify(c);	
					url = url + "&q=" + encodeURI(q);	
					
				}else{
					var c ={}
					if(!(!condition || !fields_find || fields_find.length==0)){
						c.$or=[]
						fields_find.forEach(function(field){
							var o={};
							o[field] = {$regex:condition,$options:'i'};
							c.$or.push(o);
						});
					}else{
						if(queryParams){
							_.extend(c,queryParams);
						}
					}
					if(filter){
						_.extend(c,filter);
					}
					if(onCondition){
						onCondition(c,condition);
					}
					url = url + "&q=" + encodeURI(JSON.stringify(c));
				}
				if(fields){
					url = url + "&fields=" + fields;
				}
				
				return $http.get(url);
			},
			next:function(id_app,field){
				return $http.get(url_service() + "/next/" + field);
			},
			get:function(id_app,id){
				return $http.get(url_service() + "/" + id );
			},
			create:function(id_app,data){
				return $http.post(url_service(),data);
			},
			update:function(id_app,id,data){
				return $http.put(url_service() + "/" + id,data);
			},
			delete:function(id_app,id){
				return $http.delete(url_service() + "/" + id );
			},
			getSocai:function(id_app,id){
				return $http.get(url_service() + "/socai/" + id);
			},
			getVsocai:function(id_app,id){
				return $http.get(url_service() + "/vsocai/" + id);
			}
			
		}
	//add function load
	sv.load = function(id_app,options){
		if(options){
			return sv.list(id_app,options.condition,options.fields,options.count,options.page,options.limit,options.queryParams,options.onCondition,options.filter);
		}else{
			return sv.list(id_app);
		}
		
	}
	
	if(services){
		_.extend(sv,services($http));
	}
	return sv;
}