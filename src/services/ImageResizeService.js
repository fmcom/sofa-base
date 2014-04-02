angular.module('sdk.services.imageResizeService', ['sdk.services.configService']).factory('imageResizeService', ['configService',
    function(configService) {
        // TODO move to config service
        // TODO host image resizer properly
        var RESIZER_ENDPOINT = 'http://cdn.marder25.de/imageresizer/';
        var RESIZER_ENABLED = true;
        // http://phpjs.org/functions/base64_encode/
        function base64_encode(data) {
            // http://kevin.vanzonneveld.net
            // +   original by: Tyler Akins (http://rumkin.com)
            // +   improved by: Bayron Guevara
            // +   improved by: Thunder.m
            // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // +   bugfixed by: Pellentesque Malesuada
            // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            // +   improved by: Rafał Kukawski (http://kukawski.pl)
            // *     example 1: base64_encode('Kevin van Zonneveld');
            // *     returns 1: 'S2V2aW4gdmFuIFpvbm5ldmVsZA=='
            // mozilla has this native
            // - but breaks in 2.0.0.12!
            if (typeof this.window['btoa'] === 'function') {
                return btoa(data);
            }
            var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
            var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
                ac = 0,
                enc = "",
                tmp_arr = [];
            if (!data) {
                return data;
            }
            do { // pack three octets into four hexets
                o1 = data.charCodeAt(i++);
                o2 = data.charCodeAt(i++);
                o3 = data.charCodeAt(i++);
                bits = o1 << 16 | o2 << 8 | o3;
                h1 = bits >> 18 & 0x3f;
                h2 = bits >> 12 & 0x3f;
                h3 = bits >> 6 & 0x3f;
                h4 = bits & 0x3f;
                // use hexets to index into b64, and append result to encoded string
                tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
            } while (i < data.length);
            enc = tmp_arr.join('');
            var r = data.length % 3;
            return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
        };

        //http://stackoverflow.com/questions/1714786/querystring-encoding-of-a-javascript-object
		function objectToQueryString(obj) {
			var str = [];
			for(var p in obj)
			if (obj.hasOwnProperty(p)) {
				str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
			}
			return str.join("&");
		};

        // http://www.developerdrive.com/2013/08/turning-the-querystring-into-a-json-object-using-javascript/
        function queryStringToObject(queryString) {            
            var pairs = queryString.split('&');
            var result = {};
            pairs.forEach(function(pair) {
                pair = pair.split('=');
                result[pair[0]] = decodeURIComponent(pair[1] || '');
            });
            return JSON.parse(JSON.stringify(result));
        };

        var resizeUrlCache = {},
            self = {};

        self.resize = function(imageUrl, args) {
            if (!RESIZER_ENABLED) {
                return(imageUrl);
            }

            var cacheKey;
            if (typeof args == 'string' || args instanceof String ) {
                cacheKey = imageUrl + args;
            }
            else {
                cacheKey = imageUrl + objectToQueryString(args);
            }
            if (resizeUrlCache[cacheKey]) {
                return (resizeUrlCache[cacheKey]);
            }

            // no cache hit, decode string argument to object if required
            if (typeof args == 'string' || args instanceof String ) {
                args = queryStringToObject(args);
            }

        	if (!args.hasOwnProperty('maxwidth') || !args.hasOwnProperty('maxheight')) {
        		throw new Error('maxwidth and maxheight are required parameters')
        	}

        	// Add protocol if not specified in URL
        	if (/^\/\//.test(imageUrl)) {
        		imageUrl = window.location.protocol + imageUrl;
        	};

        	var defaults = { 
        			cmd: 'resize',
        			url: imageUrl,
        			quality: 100 
    			},
        		fullArgs = sofa.Util.extend(args, defaults),
        		imageExt = imageUrl.substring(imageUrl.lastIndexOf('.')+1);

        	// In case of retina display, need to fetch larger image
        	if (window.devicePixelRatio > 1) {
        		fullArgs.maxwidth *= window.devicePixelRatio;
        		fullArgs.maxheight *= window.devicePixelRatio;
        	}

        	var encodedCall = base64_encode(objectToQueryString(fullArgs)).replace('/','_') + '.' + imageExt,
        		resizedImageUrl = RESIZER_ENDPOINT + encodedCall;

            resizeUrlCache[cacheKey] = resizedImageUrl;

            return resizedImageUrl;
        }

        return self;
    }
]);