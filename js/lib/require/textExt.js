define(['text', 'easyxdm'], function(text, easyXDM) {

	text.useXhr = function(url, protocol, hostname, port) {
		return true;
	}
	
	var defaultImp = text.get;

	text.get = function(url, callback, errback) {
		var xhr = text.createXhr();
		if (xhr) {
			defaultImp(url, callback, errback);
		} else {
			var pattern = new RegExp("^https?://[a-z0-9]+\.[a-z0-9]+\.[a-z0-9]+\.[a-z0-9]+[:0-9]*");

			var domain = url.match(pattern);
			if (!domain) {			
				$.ajax({
					url : url,
					success : callback,
					error : errback
				});
				return;
			}

			var xhr = new easyXDM.Rpc({
				swf : domain + "/shell/lib/easyxdm/easyxdm.swf",
				remote : domain + "/shell/lib/easyxdm/cors/index.html"
			}, {
				remote : {
					request : {}
				}
			});
			xhr.request({
				url : url,
				method : 'GET'
			}, function(resp) {
				callback(resp.data);
			});
		}
	}
});